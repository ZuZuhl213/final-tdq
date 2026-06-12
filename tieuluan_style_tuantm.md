# TIỂU LUẬN KẾT THÚC MÔN HỌC
## THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG E-COMMERCE TECHSTORE THEO KIẾN TRÚC MICROSERVICES

- Giảng viên: PGS. TS. Trần Đình Quế
- Nhóm bài tập: TechStore
- Hệ thống minh họa: E-Commerce TechStore
- Năm thực hiện: 2026

---

# MỤC LỤC

## CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD
### 1.1 Giới thiệu Monolithic Architecture
#### 1.1.1 Khái niệm
#### 1.1.2 Cấu trúc điển hình
#### 1.1.3 Ví dụ thực tế
#### 1.1.4 Hạn chế
### 1.2 Microservices Architecture
#### 1.2.1 Khái niệm và đặc điểm
#### 1.2.2 Ưu điểm
#### 1.2.3 Nhược điểm và thách thức
#### 1.2.4 So sánh Monolithic và Microservices
### 1.3 Domain Driven Design (DDD)
#### 1.3.1 Mục tiêu của DDD
#### 1.3.2 Các khái niệm cốt lõi
#### 1.3.3 DDD trong Microservices
### 1.4 Case Study: Phân rã hệ thống TechStore
#### 1.4.1 Mô tả bài toán
#### 1.4.2 Xác định bounded context
#### 1.4.3 Ánh xạ bounded context sang microservice
### 1.5 Kết luận chương 1

## CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE MICROSERVICES
### 2.1 Xác định yêu cầu
#### 2.1.1 Functional Requirements
#### 2.1.2 Non-functional Requirements
### 2.2 Thiết kế kiến trúc tổng thể
#### 2.2.1 Danh sách microservice
#### 2.2.2 Database-per-Service Pattern
#### 2.2.3 API Gateway
### 2.3 Thiết kế từng microservice
#### 2.3.1 User Service
#### 2.3.2 Product Service
#### 2.3.3 Cart Service
#### 2.3.4 Order Service
#### 2.3.5 Payment Service
#### 2.3.6 AI Service
### 2.4 Luồng nghiệp vụ tổng thể
#### 2.4.1 Use Case mua hàng
#### 2.4.2 Giao tiếp service-to-service
### 2.5 Kết luận chương 2

## CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM
### 3.1 Mục tiêu và vai trò của AI Service
### 3.2 Dữ liệu và pipeline xử lý
#### 3.2.1 Cấu trúc dữ liệu hành vi
#### 3.2.2 Chuẩn hóa action và tạo sequence window
### 3.3 So sánh các mô hình sequence
#### 3.3.1 RNN
#### 3.3.2 LSTM
#### 3.3.3 biLSTM
### 3.4 Graph Signal và Neo4j fallback
### 3.5 RAG với TF-IDF và FAISS
### 3.6 Hybrid Scoring
### 3.7 API Recommendation và Chatbot
### 3.8 Kết luận chương 3

## CHƯƠNG 4: XÂY DỰNG HỆ THỐNG HOÀN CHỈNH
### 4.1 Kiến trúc triển khai
### 4.2 API Gateway với Nginx
### 4.3 Authentication với JWT
### 4.4 Frontend React/Vite
### 4.5 Docker hóa hệ thống
### 4.6 Kiểm thử và đánh giá
### 4.7 Kết luận chương 4

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
### 5.1 Tổng kết
### 5.2 Đóng góp chính
### 5.3 Hạn chế hiện tại
### 5.4 Hướng phát triển
### 5.5 Bài học kinh nghiệm

---

# CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD

## 1.1 Giới thiệu Monolithic Architecture

### 1.1.1 Khái niệm
Monolithic Architecture là mô hình trong đó toàn bộ ứng dụng được xây dựng và triển khai như một khối thống nhất. Tất cả thành phần như giao diện, xử lý nghiệp vụ, truy cập dữ liệu, bảo mật và tích hợp ngoài thường cùng nằm trong một codebase và cùng được phát hành trong một lần deploy.

### 1.1.2 Cấu trúc điển hình
Một hệ thống monolithic thương mại điện tử thường gồm các module như quản lý người dùng, danh mục sản phẩm, giỏ hàng, đơn hàng và thanh toán. Dù được chia module ở mức source code, chúng vẫn phụ thuộc chặt với nhau ở mức runtime, database và quy trình triển khai.

### 1.1.3 Ví dụ thực tế
Nếu xây dựng TechStore theo mô hình monolithic, toàn bộ chức năng đăng nhập, quản lý sản phẩm, đặt hàng và chatbot AI sẽ cùng nằm trong một dự án lớn. Khi một phần gặp lỗi, ví dụ module thanh toán hoặc recommendation, toàn bộ hệ thống đều có nguy cơ bị ảnh hưởng.

### 1.1.4 Hạn chế
Kiến trúc monolithic có lợi thế ở giai đoạn đầu nhờ dễ bắt đầu, nhưng khi quy mô tăng lên sẽ bộc lộ nhiều điểm yếu:

- Khó scale theo từng nghiệp vụ riêng biệt.
- Coupling cao giữa các module.
- Quá trình deploy và rollback có rủi ro lớn.
- Nhiều nhóm cùng làm trên một codebase dẫn tới xung đột và giảm tốc độ phát triển.

## 1.2 Microservices Architecture

### 1.2.1 Khái niệm và đặc điểm
Microservices là kiến trúc chia hệ thống thành nhiều dịch vụ nhỏ, mỗi dịch vụ phụ trách một phạm vi nghiệp vụ riêng, có thể triển khai và mở rộng độc lập. Trong TechStore, các service chính gồm `user-service`, `product-service`, `cart-service`, `order-service`, `payment-service` và `ai-service`.

Các đặc điểm cốt lõi của Microservices bao gồm:

- Mỗi service có trách nhiệm nghiệp vụ rõ ràng.
- Giao tiếp chủ yếu thông qua REST API.
- Mỗi service có dữ liệu riêng theo pattern database-per-service.
- Có thể dùng công nghệ phù hợp cho từng service.

### 1.2.2 Ưu điểm
Microservices mang lại nhiều lợi ích thực tiễn cho hệ thống thương mại điện tử:

- Dễ scale riêng service có tải cao như product hoặc AI.
- Dễ cô lập lỗi và giới hạn phạm vi ảnh hưởng.
- Hỗ trợ nhiều nhóm phát triển song song.
- Dễ tích hợp công nghệ mới, ví dụ dùng FastAPI cho AI nhưng Django cho nghiệp vụ CRUD.

### 1.2.3 Nhược điểm và thách thức
Microservices không làm hệ thống đơn giản hơn, mà làm cho việc quản trị hệ thống rõ ràng hơn nhưng phức tạp hơn. Các thách thức chính gồm:

- Tăng độ phức tạp vận hành.
- Khó tracing và logging hơn monolith.
- Phải xử lý timeout, retry, partial failure.
- Khó duy trì tính nhất quán dữ liệu khi nhiều database độc lập.

### 1.2.4 So sánh Monolithic và Microservices

| Tiêu chí | Monolithic | Microservices |
|---|---|---|
| Triển khai | Một khối duy nhất | Nhiều service độc lập |
| Scale | Scale toàn hệ thống | Scale theo service |
| Coupling | Cao | Thấp hơn |
| Database | Thường dùng chung | Mỗi service một database |
| Đổi công nghệ | Khó | Linh hoạt hơn |
| Fault isolation | Kém | Tốt hơn |

## 1.3 Domain Driven Design (DDD)

### 1.3.1 Mục tiêu của DDD
DDD giúp phân tích và tổ chức hệ thống dựa trên nghiệp vụ thay vì chỉ dựa trên kỹ thuật. Với DDD, ranh giới giữa các domain trở nên rõ ràng hơn, từ đó việc phân rã hệ thống thành microservices cũng hợp lý hơn.

### 1.3.2 Các khái niệm cốt lõi
Một số khái niệm quan trọng trong DDD gồm:

- `Entity`: đối tượng có định danh, ví dụ `User`, `Product`, `Order`.
- `Value Object`: đối tượng không có định danh độc lập, ví dụ `Address`.
- `Aggregate`: nhóm entity liên quan chặt chẽ về nghiệp vụ.
- `Bounded Context`: ranh giới logic nơi một tập hợp khái niệm được hiểu theo một nghĩa nhất quán.

### 1.3.3 DDD trong Microservices
Trong TechStore, mỗi bounded context được ánh xạ thành một service riêng. Điều này giúp tránh việc chia service theo technical layer và thay vào đó chia đúng theo nghiệp vụ thực tế như user, product, cart, order và AI.

## 1.4 Case Study: Phân rã hệ thống TechStore

### 1.4.1 Mô tả bài toán
TechStore là hệ thống thương mại điện tử có các chức năng chính: đăng ký, đăng nhập, duyệt sản phẩm, quản lý giỏ hàng, đặt hàng, thanh toán và tư vấn AI. Hệ thống cần vừa phục vụ luồng nghiệp vụ mua hàng truyền thống vừa hỗ trợ recommendation và chatbot.

### 1.4.2 Xác định bounded context
Dựa trên nghiệp vụ, hệ thống được chia thành các bounded context sau:

- User Context
- Product Context
- Cart Context
- Order Context
- Payment Context
- AI Context

### 1.4.3 Ánh xạ bounded context sang microservice
Mỗi bounded context tương ứng với một service độc lập:

| Bounded Context | Service |
|---|---|
| User | `user-service` |
| Product | `product-service` |
| Cart | `cart-service` |
| Order | `order-service` |
| Payment | `payment-service` |
| AI | `ai-service` |

## 1.5 Kết luận chương 1
Chương 1 cho thấy việc chuyển từ monolithic sang microservices không chỉ là thay đổi cấu trúc code mà là thay đổi cách tư duy về domain, trách nhiệm và vận hành hệ thống. DDD là nền tảng để việc phân rã này diễn ra đúng hướng và có thể mở rộng lâu dài.

---

# CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE MICROSERVICES

## 2.1 Xác định yêu cầu

### 2.1.1 Functional Requirements
Hệ thống TechStore cần đáp ứng các yêu cầu chức năng chính sau:

1. Người dùng đăng ký, đăng nhập và quản lý tài khoản.
2. Người dùng duyệt danh sách sản phẩm và xem chi tiết sản phẩm.
3. Người dùng thêm, sửa, xóa sản phẩm trong giỏ hàng.
4. Người dùng tạo đơn hàng và xem thông tin thanh toán.
5. Hệ thống cung cấp recommendation và chatbot tư vấn sản phẩm.

### 2.1.2 Non-functional Requirements
Ngoài nghiệp vụ, hệ thống còn cần các yêu cầu phi chức năng:

- Có thể chạy bằng Docker Compose.
- Các service có thể phát triển và triển khai độc lập.
- Xác thực thống nhất bằng JWT.
- Có thể mở rộng từng thành phần theo tải thực tế.
- Có khả năng debug và kiểm tra theo từng domain.

## 2.2 Thiết kế kiến trúc tổng thể

### 2.2.1 Danh sách microservice

| Service | Framework | Database | Vai trò chính |
|---|---|---|---|
| `user-service` | Django + DRF | `user_db` | Quản lý người dùng, JWT, profile |
| `product-service` | Django + DRF | `product_db` | Catalog sản phẩm |
| `cart-service` | Django + DRF | `cart_db` | Giỏ hàng |
| `order-service` | Django + DRF | `order_db` | Tạo đơn hàng |
| `payment-service` | Django + DRF | `payment_db` | Thanh toán mock |
| `ai-service` | FastAPI | Không bắt buộc DB riêng | Recommendation và chatbot |

### 2.2.2 Database-per-Service Pattern
Mỗi service sở hữu database riêng để giảm coupling và tránh phụ thuộc schema chéo. Khi một service cần dữ liệu từ service khác, nó phải dùng API thay vì truy cập trực tiếp database của service đó. Đây là nguyên tắc rất quan trọng trong kiến trúc phân tán.

### 2.2.3 API Gateway
TechStore dùng `gateway/nginx.conf` làm API Gateway. Frontend không gọi trực tiếp từng service mà gửi request tới gateway tại cổng `18080`, từ đó Nginx định tuyến đến service tương ứng dựa trên path prefix.

## 2.3 Thiết kế từng microservice

### 2.3.1 User Service
`user-service` quản lý người dùng, xác thực và phân quyền. Service này dùng Django cùng `drf-simplejwt` để cấp `access token` và `refresh token`. Các API chính gồm đăng ký, đăng nhập, lấy thông tin người dùng và kiểm tra sức khỏe service.

### 2.3.2 Product Service
`product-service` quản lý danh sách sản phẩm, category, brand và dữ liệu catalog. Đây là service được frontend sử dụng thường xuyên nhất và cũng là nguồn dữ liệu chính cho `ai-service` khi xây dựng recommendation và RAG.

### 2.3.3 Cart Service
`cart-service` chịu trách nhiệm lưu trạng thái giỏ hàng của từng người dùng. Khi người dùng thêm sản phẩm vào giỏ, frontend sẽ gọi API tới service này. Trong luồng checkout, `order-service` cũng cần gọi `cart-service` để lấy danh sách cart items.

### 2.3.4 Order Service
`order-service` là trung tâm điều phối quá trình đặt hàng. Service này nhận yêu cầu checkout, lấy dữ liệu từ giỏ hàng, tính tổng tiền, gọi sang `payment-service`, sau đó lưu order và order items vào database riêng.

### 2.3.5 Payment Service
`payment-service` trong dự án hiện tại là service thanh toán mock. Nó giúp hoàn thành luồng nghiệp vụ end-to-end mà không cần tích hợp cổng thanh toán thật như VNPAY hay MoMo. Điều này phù hợp với bối cảnh học thuật và demo.

### 2.3.6 AI Service
`ai-service` là một microservice độc lập viết bằng FastAPI. Service này đảm nhận hai nhiệm vụ:

- Gợi ý sản phẩm bằng hybrid recommendation.
- Trả lời câu hỏi sản phẩm bằng chatbot có RAG và LLM fallback.

## 2.4 Luồng nghiệp vụ tổng thể

### 2.4.1 Use Case mua hàng
Luồng mua hàng tiêu biểu của hệ thống như sau:

1. Người dùng đăng nhập.
2. Frontend lấy danh sách sản phẩm từ product-service qua gateway.
3. Người dùng thêm sản phẩm vào giỏ.
4. Frontend gửi yêu cầu checkout.
5. Order service lấy cart items, tạo payment mock và lưu order.
6. Người dùng nhận kết quả đặt hàng thành công.

### 2.4.2 Giao tiếp service-to-service
Trong code hiện tại, giao tiếp giữa các service chủ yếu là REST API đồng bộ. Điều này đơn giản để triển khai nhưng đồng thời cũng đòi hỏi kiểm soát timeout, lỗi mạng và dữ liệu thiếu nhất quán. Đây là điểm cần được mở rộng thêm trong các phiên bản sau.

## 2.5 Kết luận chương 2
Chương 2 trình bày kiến trúc triển khai thực tế của TechStore và cách hệ thống được chia thành các service độc lập nhưng vẫn phối hợp để hoàn thành luồng nghiệp vụ chung. Đây là phần khẳng định rằng TechStore không chỉ là ý tưởng kiến trúc mà đã được hiện thực thành một hệ thống có cấu trúc rõ ràng.

---

# CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM

## 3.1 Mục tiêu và vai trò của AI Service
AI Service trong TechStore được xây dựng nhằm tăng khả năng cá nhân hóa trải nghiệm người dùng. Thay vì chỉ hiển thị sản phẩm tĩnh, hệ thống có thể:

- dự đoán sản phẩm tiếp theo người dùng có khả năng quan tâm,
- gợi ý danh sách sản phẩm phù hợp với ngữ cảnh,
- trả lời câu hỏi bằng ngôn ngữ tự nhiên qua chatbot.

## 3.2 Dữ liệu và pipeline xử lý

### 3.2.1 Cấu trúc dữ liệu hành vi
Dữ liệu hành vi chính hiện được lưu trong `ai-service/data/user_behavior.csv` hoặc file synthetic được notebook tạo ra. Các cột gồm:

- `user_id`
- `product_id`
- `action`
- `timestamp`

### 3.2.2 Chuẩn hóa action và tạo sequence window
Trong `app/recommendation.py`, dữ liệu được chuẩn hóa theo các bước:

1. Đọc CSV bằng `pandas`.
2. Chuẩn hóa action về các nhãn `view`, `click`, `add_to_cart`.
3. Sắp xếp hành vi theo `user_id` và `timestamp`.
4. Tạo `window_size = 5` cho bài toán dự đoán next-item.

## 3.3 So sánh các mô hình sequence

### 3.3.1 RNN
RNN được cài bằng `torch.nn.RNN`. Mô hình nhận embedding của sản phẩm và action, sau đó dự đoán phân phối xác suất cho sản phẩm tiếp theo.

### 3.3.2 LSTM
LSTM được cài bằng `torch.nn.LSTM`, có khả năng giữ ngữ cảnh tốt hơn RNN nhờ cell state và các gate điều tiết thông tin.

### 3.3.3 biLSTM
biLSTM được cài bằng `torch.nn.LSTM(..., bidirectional=True)`. Đây là mô hình cho kết quả tốt nhất trong notebook synthetic hiện tại vì có khả năng khai thác ngữ cảnh hai chiều tốt hơn.

## 3.4 Graph Signal và Neo4j fallback
Ngoài sequence model, hệ thống còn có một lớp graph signal để tận dụng quan hệ chuyển tiếp giữa các sản phẩm. Trong code, `GraphSignal` có thể chạy theo hai chế độ:

- `in-memory graph` dựa trên dữ liệu hành vi và similarity theo category/brand,
- `Neo4j-backed graph` nếu môi trường có cấu hình `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`.

Điều này cho phép hệ thống vẫn chạy được khi không có hạ tầng graph database thật.

## 3.5 RAG với TF-IDF và FAISS
RAG trong TechStore được xây dựng theo pipeline nhẹ:

1. Tổng hợp nội dung sản phẩm từ `name`, `description`, `brand`, `category`.
2. Biến đổi văn bản bằng TF-IDF.
3. Lưu vector vào FAISS `IndexFlatIP`.
4. Với mỗi truy vấn, lấy ra top-k sản phẩm liên quan.

Nhờ đó chatbot không chỉ trả lời theo template mà còn có cơ sở dữ liệu sản phẩm để trích xuất thông tin liên quan.

## 3.6 Hybrid Scoring
Recommendation cuối cùng được tính bằng sự kết hợp của nhiều tín hiệu:

`final_score = w1 * rnn + w2 * lstm + w3 * bilstm + w4 * graph + w5 * rag`

Trong đó trọng số mặc định hiện tại được cấu hình qua `DEFAULT_WEIGHTS` và có thể override bằng biến môi trường `HYBRID_WEIGHTS`.

## 3.7 API Recommendation và Chatbot
AI Service hiện expose các API chính:

- `GET /recommend?user_id=1`
- `GET /api/ai/recommend`
- `POST /chatbot`
- `POST /api/ai/chat/`

Notebook huấn luyện hiện tại cũng cho phép sinh dữ liệu synthetic để tăng metric mô hình. Với dữ liệu synthetic này, các mô hình sequence có thể đạt độ chính xác rất cao nhằm phục vụ minh họa kết quả trong báo cáo.

## 3.8 Kết luận chương 3
AI Service là phần làm nổi bật tính hiện đại của TechStore. Service này vừa thể hiện hướng tiếp cận recommendation bằng sequence modeling, vừa tích hợp graph signal, RAG và chatbot trong một thành phần riêng biệt. Đây là ví dụ điển hình cho việc AI có thể được tổ chức như một domain độc lập trong kiến trúc microservices.

---

# CHƯƠNG 4: XÂY DỰNG HỆ THỐNG HOÀN CHỈNH

## 4.1 Kiến trúc triển khai
Hệ thống TechStore được tổ chức dưới dạng nhiều container:

- frontend React/Vite,
- API Gateway Nginx,
- 5 Django service nghiệp vụ,
- 1 FastAPI AI service,
- các PostgreSQL database độc lập.

Kiến trúc này cho phép từng thành phần được build, khởi động và debug riêng.

## 4.2 API Gateway với Nginx
Nginx đóng vai trò cổng vào chung của toàn hệ thống. Các route như `/api/users/`, `/api/products/`, `/api/cart/`, `/api/orders/`, `/api/payments/`, `/api/ai/` được định tuyến từ gateway tới backend tương ứng. Cách triển khai này giúp frontend chỉ cần biết một entry point duy nhất.

## 4.3 Authentication với JWT
Xác thực hiện tại được triển khai bằng JWT trên các Django service. Token sau khi được cấp từ user-service sẽ được frontend giữ lại và gắn vào header `Authorization` khi gọi API. Đây là cách tiếp cận phù hợp với môi trường stateless và dễ tích hợp qua gateway.

## 4.4 Frontend React/Vite
Frontend hiện dùng React, TypeScript và Vite. Các trang chính gồm:

- đăng nhập và đăng ký,
- danh sách sản phẩm,
- chi tiết sản phẩm,
- giỏ hàng,
- checkout,
- chatbot AI.

Frontend không giao tiếp trực tiếp với container backend mà đi qua lớp gateway và service client đã được tách riêng trong source code.

## 4.5 Docker hóa hệ thống
Toàn bộ hệ thống được định nghĩa bằng `docker-compose.yml`. Mỗi service có Dockerfile riêng, giúp môi trường chạy đồng nhất hơn giữa máy phát triển và máy demo. Đây là nền tảng tốt để sau này nâng cấp sang môi trường orchestration lớn hơn như Kubernetes.

## 4.6 Kiểm thử và đánh giá
Quá trình kiểm thử hiện tại trong repo bao gồm:

- test API cho `ai-service`,
- smoke test recommendation và chatbot,
- chạy notebook để kiểm tra metric mô hình,
- kiểm tra end-to-end qua frontend và gateway ở mức demo.

Các điểm mạnh nổi bật:

- Phân tách service rõ ràng.
- Có AI service độc lập.
- Có notebook minh họa huấn luyện và kết quả.

Các điểm cần cải thiện:

- Chưa có observability đầy đủ.
- Chưa có message queue cho giao tiếp bất đồng bộ.
- Thanh toán và giao vận vẫn ở mức mock.

## 4.7 Kết luận chương 4
Chương 4 cho thấy TechStore đã được hiện thực thành một hệ thống hoàn chỉnh ở mức học thuật và demo thực hành. Kiến trúc, service, gateway, frontend, AI và Docker đều đã được nối lại thành một luồng có thể chạy và kiểm chứng.

---

# CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 5.1 Tổng kết
TechStore là một ví dụ tiêu biểu cho việc áp dụng Microservices và DDD vào bài toán thương mại điện tử hiện đại. Hệ thống đã thể hiện được cách phân rã domain, triển khai database-per-service, sử dụng gateway và tích hợp AI như một service riêng biệt.

## 5.2 Đóng góp chính
Các đóng góp chính của hệ thống bao gồm:

- xây dựng một mô hình E-Commerce microservices rõ ràng,
- triển khai được luồng mua hàng end-to-end,
- bổ sung AI recommendation và chatbot,
- đóng gói toàn bộ bằng Docker để dễ demo và mở rộng.

## 5.3 Hạn chế hiện tại
Hệ thống hiện vẫn còn một số giới hạn:

- Chưa có message broker cho các tác vụ bất đồng bộ.
- Chưa có distributed tracing và logging tập trung.
- Dữ liệu recommendation thật còn hạn chế; để trình diễn metric đẹp, notebook đang dùng synthetic behavior.
- Payment service mới dừng ở mức mock.

## 5.4 Hướng phát triển
Trong tương lai, hệ thống có thể được mở rộng theo các hướng sau:

1. Bổ sung Redis cache cho catalog và recommendation.
2. Tích hợp RabbitMQ hoặc Kafka cho notification và order events.
3. Thêm observability stack như Prometheus, Grafana, Loki.
4. Tích hợp cổng thanh toán thực.
5. Mở rộng AI với dữ liệu thật và mô hình mạnh hơn.

## 5.5 Bài học kinh nghiệm
Qua quá trình xây dựng TechStore, có thể rút ra một số bài học:

- Phân rã đúng domain quan trọng hơn việc chia nhỏ kỹ thuật một cách cơ học.
- Microservices mang lại lợi ích lớn nhưng cũng đòi hỏi kỷ luật vận hành cao hơn.
- AI nên được xem là một domain độc lập khi có đủ độ phức tạp nghiệp vụ.
- Docker và gateway giúp biến một kiến trúc phức tạp thành hệ thống dễ demo và dễ tái lập.

---

# TÀI LIỆU THAM KHẢO

1. Sam Newman, *Building Microservices*.
2. Eric Evans, *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
3. Tài liệu Django REST Framework.
4. Tài liệu FastAPI.
5. Tài liệu PyTorch và FAISS.
