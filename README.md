# Báo Cáo Hệ Thống E-Commerce TechStore (Microservices Architecture)

## 1. Tổng Quan Hệ Thống (System Overview)
TechStore là hệ thống thương mại điện tử dựa trên kiến trúc **Microservices**.
- **Mục đích:** Cung cấp trải nghiệm mua sắm hoàn chỉnh (Đăng ký/đăng nhập, duyệt sản phẩm, giỏ hàng, đặt hàng, thanh toán) tích hợp AI Chatbot và Recommendation.
- **Kiến trúc:** 6 Microservices độc lập, giao tiếp thông qua REST API (đồng bộ).
- **API Gateway:** Sử dụng Nginx làm entrypoint (cổng 18080).
- **Xác thực:** JWT (JSON Web Token) chia sẻ chung secret key giữa các service.
- **Database:** Pattern Database-per-Service sử dụng PostgreSQL cho 5 dịch vụ ứng dụng.

## 2. Sơ Đồ Kiến Trúc (Architecture Diagram)

```mermaid
graph TD
    Client[Client React/Vite] -->|HTTP/REST| Gateway[API Gateway Nginx :18080]
    
    Gateway -->|/api/auth/, /api/users/| UserService[user-service :800x]
    Gateway -->|/api/products/, /categories/| ProductService[product-service :800x]
    Gateway -->|/api/cart/| CartService[cart-service :800x]
    Gateway -->|/api/orders/| OrderService[order-service :800x]
    Gateway -->|/api/payments/| PaymentService[payment-service :800x]
    Gateway -->|/api/ai/| AIService[ai-service :5000]

    UserService -->|Read/Write| UserDB[(user_db Postgres)]
    ProductService -->|Read/Write| ProductDB[(product_db Postgres)]
    CartService -->|Read/Write| CartDB[(cart_db Postgres)]
    OrderService -->|Read/Write| OrderDB[(order_db Postgres)]
    PaymentService -->|Read/Write| PaymentDB[(payment_db Postgres)]

    OrderService -.->|GET items| CartService
    OrderService -.->|POST payment| PaymentService
    
    AIService -.->|Embedding/RAG| FAISS[(FAISS Vector Index)]
    AIService -.->|Prompt| Gemini[Google Gemini API]
```

## 3. Sơ Đồ Use Case & Sơ Đồ Tuần Tự (UML Diagrams)

### 3.1. Sơ Đồ Use Case (Use Case Diagram)
Mô tả các chức năng chính mà người dùng (Customer) và Quản trị viên (Admin) có thể thực hiện trên hệ thống.

```mermaid
flowchart LR
    Customer([Khách hàng])
    Admin([Quản trị viên])
    
    UC1(Đăng ký / Đăng nhập)
    UC2(Xem & Tìm kiếm sản phẩm)
    UC3(Quản lý Giỏ hàng)
    UC4(Đặt hàng & Thanh toán)
    UC5(Chat với AI Tư vấn)
    UC6(Quản lý Sản phẩm / Đơn hàng)
    
    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    
    Admin --> UC1
    Admin --> UC6
```

### 3.2. Sơ Đồ Tuần Tự: Luồng Thanh Toán (Checkout Sequence Diagram)
Mô tả quá trình giao tiếp liên dịch vụ (sync) khi người dùng thực hiện thanh toán đơn hàng.

```mermaid
sequenceDiagram
    actor User
    participant FrontEnd as Frontend
    participant API as API Gateway (Nginx)
    participant OrderSvc as Order Service
    participant CartSvc as Cart Service
    participant PaymentSvc as Payment Service
    participant OrderDB as Order DB

    User->>FrontEnd: Bấm "Thanh toán"
    FrontEnd->>API: POST /api/orders/ (kèm JWT)
    API->>OrderSvc: Chuyển tiếp request
    
    OrderSvc->>CartSvc: GET /api/cart/ (Lấy danh sách sản phẩm)
    CartSvc-->>OrderSvc: Trả về Cart Items
    
    OrderSvc->>PaymentSvc: POST /api/payments/ (Gửi yêu cầu thanh toán)
    PaymentSvc-->>OrderSvc: Trả về trạng thái Success & Transaction Code
    
    OrderSvc->>OrderDB: Lưu Order & OrderItem
    OrderDB-->>OrderSvc: Xác nhận lưu DB thành công
    
    OrderSvc->>CartSvc: (Tùy chọn) Xóa Cart Items đã thanh toán
    CartSvc-->>OrderSvc: Trả về OK
    
    OrderSvc-->>API: Trả về thông tin đơn hàng (Order ID)
    API-->>FrontEnd: HTTP 201 Created
    FrontEnd-->>User: Hiển thị "Đặt hàng thành công"
```

### 3.3. Sơ Đồ Tuần Tự: Luồng AI Chatbot (RAG Sequence Diagram)
Mô tả luồng người dùng chat với AI lấy dữ liệu thực tế từ hệ thống (Retrieval-Augmented Generation).

```mermaid
sequenceDiagram
    actor User
    participant FrontEnd as Frontend
    participant API as API Gateway
    participant AISvc as AI Service
    participant FAISS as FAISS (Vector DB)
    participant Gemini as Google Gemini API

    User->>FrontEnd: Nhắn tin vào Chatbox
    FrontEnd->>API: POST /api/ai/chat/ {"query": "..."}
    API->>AISvc: Chuyển tiếp request
    
    AISvc->>AISvc: Nhúng (Embed) câu hỏi bằng sentence-transformers
    AISvc->>FAISS: Search top-5 sản phẩm liên quan (Similarity Search)
    FAISS-->>AISvc: Trả về danh sách sản phẩm
    
    AISvc->>AISvc: Xây dựng Prompt (Câu hỏi + Policy + Danh sách SP)
    
    AISvc->>Gemini: Gửi Prompt (Yêu cầu JSON response)
    Gemini-->>AISvc: Trả về kết quả JSON (Answer + Suggested Products)
    
    AISvc->>AISvc: Validate JSON & Lọc sản phẩm hết hàng
    AISvc-->>API: Trả về JSON Response
    API-->>FrontEnd: HTTP 200 OK
    FrontEnd-->>User: Hiển thị câu trả lời & Nút "Thêm vào giỏ"
```

## 4. Danh Sách Microservices

| Service | Framework | Database | Chức Năng Chính |
|---------|-----------|----------|-----------------|
| **user-service** | Django + DRF | `user_db` | Quản lý người dùng, JWT Auth, Phân quyền, Profile. |
| **product-service** | Django + DRF | `product_db` | Quản lý Catalog sản phẩm, Categories, Brands. Có sẵn script sinh data. |
| **cart-service** | Django + DRF | `cart_db` | Quản lý giỏ hàng (thêm/xóa/sửa item), mỗi user gắn với 1 cart. |
| **order-service** | Django + DRF | `order_db` | Tạo và quản lý đơn hàng. Tích hợp thanh toán chéo service. |
| **payment-service** | Django + DRF | `payment_db` | Dịch vụ mock thanh toán (luôn trả về trạng thái success). |
| **ai-service** | FastAPI | (Không) | Hybrid Recommendation, RAG Chatbot sử dụng LLM Gemini & FAISS. |

*(Chú thích: Mỗi service chạy trên container Docker độc lập. Các database không sử dụng Foreign Key liên kết với nhau để đảm bảo tính lỏng lẻo - loose coupling).*

## 5. Các File Code Trọng Yếu

Hệ thống yêu cầu các thành phần file sau để triển khai chính xác theo cấu trúc mô tả trong báo cáo:
- `docker-compose.yml`: Khai báo và quản lý 6 services, 5 DBs, Gateway, và Frontend.
- `gateway/nginx.conf`: File cấu hình routing proxy_pass từ API Gateway tới các backend microservices.
- `user-service/users/models.py`, `product-service/products/models.py`: Định nghĩa DB models đại diện cho các entity chính.
- `order-service/orders/views.py`: Nơi xử lý logic kết nối liên dịch vụ (gọi HTTP synchronous sang `cart-service` để chốt đơn, gọi sang `payment-service` để trả tiền).
- `ai-service/app/main.py`: FastAPI endpoint nhận request chat và recommend.
- `ai-service/app/gemini_client.py`: Logic tương tác với Google Gemini API.
- `ai-service/app/rag_engine.py`: Logic nhúng (embedding) mô tả sản phẩm và sử dụng vector database FAISS để retrieve dữ liệu.
- `frontend/src/...`: Các component React, cấu hình Axios interceptor truyền JWT Token, quản lý global state qua Zustand.

## 6. Phân Tích Sự Bất Đồng (Discrepancies) Giữa Code & Báo Cáo

Dựa trên code thực tế và Báo cáo lý thuyết bạn cung cấp, phát hiện một vài điểm chưa khớp cần điều chỉnh:

1. **Phiên bản Gemini API Model:**
   - *Trong Báo cáo:* Ghi rõ sử dụng mô hình `gemini-1.5-flash`.
   - *Trong Code:* Tại `ai-service/app/gemini_client.py` dòng 18, code đang hardcode sử dụng `gemini-1.0-pro`.
2. **Port Khởi Chạy Frontend:**
   - *Trong Báo cáo:* Frontend map port host ra `13000:3000`.
   - *Trong Code:* Tại `docker-compose.yml`, frontend đang cấu hình map port host là `5173:80` (sử dụng base image Nginx chạy file build của Vite).
3. **Cổng Internal (Container Port) của Django Services:**
   - *Trong Báo cáo:* Các service (user, product, cart, order, payment) lắng nghe ở cổng `8000`.
   - *Trong Code:* Mỗi service được expose và bind ở một cổng riêng biệt (`8001` đến `8005`) trong Dockerfile cũng như proxy của Nginx. Đây là practice tốt để tránh lỗi khi dev trên host, nhưng khác với text trong tài liệu.

## 7. Checklist Kiểm Tra Hệ Thống

| Hạng mục | Tài liệu mô tả | Code hiện hành | Trạng thái | Đề xuất |
|---|---|---|---|---|
| **Kiến trúc** | Microservices, Docker | Đã chia tách thành các module | ✅ Đồng bộ | Không có |
| **API Gateway** | Nginx port 18080 | Nginx map 18080:80 | ✅ Đồng bộ | Không có |
| **Cơ sở dữ liệu** | Database-per-service | 5 containers PostgreSQL | ✅ Đồng bộ | Không có |
| **Xác thực API** | Share JWT Secret Key | Dùng `drf-simplejwt` chung key | ✅ Đồng bộ | Không có |
| **Frontend Mapping** | `13000:3000` | `5173:80` | ⚠️ Lệch | Nên sửa text báo cáo hoặc cập nhật docker-compose |
| **Django Internal Port**| `8000` | `8001`, `8002`, `8003`, v.v. | ⚠️ Lệch | Bổ sung lý do sử dụng port khác nhau vào báo cáo |
| **Mô hình AI RAG** | `gemini-1.5-flash` | `gemini-1.0-pro` | ⚠️ Lệch | Đổi code trong `gemini_client.py` thành 1.5-flash |

## 8. Prompt Khuyến Nghị Dành Cho Lượt Dev Tiếp Theo

Để tôi (Agent) có thể tự động sửa lại code cho khớp 100% với báo cáo, bạn chỉ cần copy và paste câu Prompt sau đây vào chatbox:

> *"Hãy giúp tôi fix những điểm bất đồng giữa báo cáo và code: 1) Cập nhật model thành `gemini-1.5-flash` trong `ai-service`. 2) Đổi port frontend trong `docker-compose.yml` thành `13000:3000` (nếu cần đổi config nginx của frontend thì hãy xử lý luôn). 3) Cập nhật lại Gateway `nginx.conf` và các Dockerfile nếu bạn thấy cần đưa tất cả internal ports về `8000` như báo cáo mô tả, hoặc giải thích cho tôi để tôi tự sửa trong file word."*
