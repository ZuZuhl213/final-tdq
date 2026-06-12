# TIỂU LUẬN KẾT THÚC MÔN HỌC
## THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ TECHSTORE THEO KIẾN TRÚC MICROSERVICES, TÍCH HỢP AI RECOMMENDATION VÀ CHATBOT

- Học phần: Software Architecture and Design
- Giảng viên hướng dẫn: PGS. TS. Trần Đình Quế
- Nhóm thực hiện: TechStore
- Công nghệ chính: Django REST Framework, FastAPI, React/Vite, PostgreSQL, Nginx, Docker, PyTorch, FAISS
- Năm thực hiện: 2026

---

# LỜI MỞ ĐẦU

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, thương mại điện tử không còn là một hệ thống đơn giản chỉ bao gồm danh sách sản phẩm và một vài thao tác đặt hàng cơ bản. Một nền tảng bán hàng hiện đại cần đáp ứng đồng thời nhiều yêu cầu: tốc độ phản hồi nhanh, khả năng phục vụ số lượng lớn người dùng cùng lúc, khả năng mở rộng theo từng nhóm nghiệp vụ, quản lý dữ liệu đáng tin cậy, và đặc biệt là khả năng cá nhân hóa trải nghiệm người dùng thông qua các thành phần trí tuệ nhân tạo. Khi quy mô tăng lên, mô hình kiến trúc monolithic truyền thống bắt đầu bộc lộ các hạn chế cố hữu như coupling cao, khó triển khai độc lập, khó mở rộng từng phần, và khó áp dụng các công nghệ mới cho những bài toán chuyên biệt như recommendation hoặc chatbot.

Từ yêu cầu đó, bài tiểu luận này lựa chọn kiến trúc Microservices kết hợp Domain-Driven Design (DDD) để phân rã hệ thống thương mại điện tử TechStore thành các dịch vụ độc lập theo ranh giới nghiệp vụ. Các chức năng cốt lõi như quản lý người dùng, quản lý sản phẩm, giỏ hàng, đơn hàng, thanh toán và AI được triển khai tách biệt, giao tiếp với nhau chủ yếu qua REST API. Hướng tiếp cận này giúp hệ thống linh hoạt hơn trong phát triển, dễ bảo trì hơn trong dài hạn, và tạo điều kiện thuận lợi để đưa những thành phần có đặc thù kỹ thuật khác biệt như AI Service vào vận hành mà không phá vỡ cấu trúc tổng thể.

Điểm nhấn nổi bật của TechStore là việc bổ sung một AI Service độc lập, có khả năng gợi ý sản phẩm và hỗ trợ chatbot tư vấn. Thay vì chỉ mô tả lý thuyết, hệ thống hiện thực hóa một pipeline thực tế bao gồm mô hình sequence để dự đoán hành vi tiếp theo của người dùng, graph signal để bổ sung quan hệ chuyển tiếp giữa sản phẩm, và RAG để tăng chất lượng trả lời theo ngữ cảnh sản phẩm. Điều này giúp bài tiểu luận không chỉ dừng lại ở việc trình bày các khái niệm kiến trúc phần mềm, mà còn kết nối chúng với bài toán ứng dụng cụ thể trong một sản phẩm có thể chạy được.

Mục tiêu của bài tiểu luận là trình bày toàn bộ quá trình từ phân tích lý thuyết đến thiết kế và triển khai hệ thống thực tế. Nội dung bao gồm: cơ sở lý thuyết về monolithic, microservices và DDD; phân rã hệ thống theo bounded context; thiết kế các microservice chính; xây dựng API Gateway và cơ chế xác thực JWT; triển khai frontend; đóng gói container bằng Docker; và phân tích chi tiết AI Service. Bằng cách kết hợp giữa góc nhìn học thuật và việc bám sát codebase hiện có, tài liệu này hướng tới một sản phẩm vừa có giá trị học tập, vừa có tính minh họa thực hành cao.

---

# MỤC LỤC

## CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD
### 1.1 Giới thiệu Monolithic Architecture
#### 1.1.1 Khái niệm
#### 1.1.2 Cấu trúc điển hình
#### 1.1.3 Ưu điểm của monolithic ở giai đoạn đầu
#### 1.1.4 Hạn chế khi hệ thống tăng trưởng
### 1.2 Microservices Architecture
#### 1.2.1 Khái niệm
#### 1.2.2 Đặc điểm cốt lõi
#### 1.2.3 Ưu điểm
#### 1.2.4 Nhược điểm và thách thức
#### 1.2.5 So sánh Monolithic và Microservices
### 1.3 Domain-Driven Design (DDD)
#### 1.3.1 Mục tiêu của DDD
#### 1.3.2 Các khái niệm quan trọng
#### 1.3.3 Bounded Context và Context Map
#### 1.3.4 Vai trò của DDD trong Microservices
### 1.4 Áp dụng DDD vào hệ thống TechStore
#### 1.4.1 Phân tích bài toán
#### 1.4.2 Xác định domain và subdomain
#### 1.4.3 Xác định bounded context
#### 1.4.4 Ánh xạ bounded context sang microservice
### 1.5 Kết luận chương 1

## CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE MICROSERVICES
### 2.1 Xác định yêu cầu hệ thống
#### 2.1.1 Functional Requirements
#### 2.1.2 Non-functional Requirements
### 2.2 Kiến trúc tổng thể hệ thống
#### 2.2.1 Danh sách microservice
#### 2.2.2 Database-per-Service Pattern
#### 2.2.3 API Gateway
#### 2.2.4 Chia sẻ trách nhiệm giữa frontend và backend
### 2.3 Thiết kế chi tiết từng service
#### 2.3.1 User Service
#### 2.3.2 Product Service
#### 2.3.3 Cart Service
#### 2.3.4 Order Service
#### 2.3.5 Payment Service
#### 2.3.6 AI Service
### 2.4 Thiết kế dữ liệu và mô hình triển khai
#### 2.4.1 Cấu trúc database
#### 2.4.2 Tính độc lập dữ liệu giữa các service
#### 2.4.3 Ràng buộc và nhất quán dữ liệu
### 2.5 Luồng nghiệp vụ toàn hệ thống
#### 2.5.1 Use case mua hàng end-to-end
#### 2.5.2 Luồng đăng nhập và xác thực
#### 2.5.3 Luồng truy vấn recommendation
### 2.6 Đánh giá kiến trúc chương 2
### 2.7 Kết luận chương 2

## CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM
### 3.1 Mục tiêu và kiến trúc AI Service
#### 3.1.1 Bài toán recommendation
#### 3.1.2 Bài toán chatbot
#### 3.1.3 Kiến trúc thực tế của AI Service
### 3.2 Dữ liệu hành vi người dùng
#### 3.2.1 Cấu trúc file dữ liệu
#### 3.2.2 Chuẩn hóa action
#### 3.2.3 Tạo sequence dataset
#### 3.2.4 Vai trò của dữ liệu synthetic
### 3.3 Sequence Modeling với RNN, LSTM và biLSTM
#### 3.3.1 Ý tưởng chung
#### 3.3.2 Kiến trúc RNN
#### 3.3.3 Kiến trúc LSTM
#### 3.3.4 Kiến trúc biLSTM
#### 3.3.5 Quy trình huấn luyện và đánh giá
### 3.4 Graph Signal và quan hệ sản phẩm
#### 3.4.1 Graph in-memory
#### 3.4.2 Similarity theo category và brand
#### 3.4.3 Hỗ trợ Neo4j
### 3.5 RAG với TF-IDF và FAISS
#### 3.5.1 Xây dựng biểu diễn văn bản sản phẩm
#### 3.5.2 Tạo index vector
#### 3.5.3 Truy hồi sản phẩm liên quan
### 3.6 Hybrid Scoring
#### 3.6.1 Công thức tính điểm
#### 3.6.2 Ý nghĩa của từng thành phần
#### 3.6.3 Giải thích tính minh bạch của kết quả
### 3.7 Chatbot tư vấn sản phẩm
#### 3.7.1 Tích hợp Gemini/Groq
#### 3.7.2 Fallback response
#### 3.7.3 Cấu trúc response API
### 3.8 Kết quả thực nghiệm và notebook huấn luyện
#### 3.8.1 Notebook training
#### 3.8.2 Kết quả với dữ liệu gốc
#### 3.8.3 Kết quả với dữ liệu synthetic
### 3.9 Kết luận chương 3

## CHƯƠNG 4: XÂY DỰNG HỆ THỐNG HOÀN CHỈNH
### 4.1 Kiến trúc triển khai
### 4.2 API Gateway với Nginx
### 4.3 Xác thực JWT
### 4.4 Frontend React/Vite
### 4.5 Docker hóa toàn bộ hệ thống
### 4.6 Kiểm thử và đánh giá
### 4.7 Kết luận chương 4

## CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
### 5.1 Tổng kết
### 5.2 Đóng góp chính của đồ án
### 5.3 Hạn chế hiện tại
### 5.4 Hướng phát triển ngắn hạn và dài hạn
### 5.5 Bài học kinh nghiệm

## TÀI LIỆU THAM KHẢO
## PHỤ LỤC

---

# CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD

## 1.1 Giới thiệu Monolithic Architecture

### 1.1.1 Khái niệm
Monolithic Architecture là kiểu kiến trúc trong đó toàn bộ ứng dụng được xây dựng như một khối thống nhất. Từ giao diện, xử lý nghiệp vụ, truy cập dữ liệu, xác thực, phân quyền cho đến các tích hợp bên ngoài, tất cả thường cùng nằm trong một codebase và được triển khai theo một tiến trình hoặc một gói triển khai duy nhất. Trong bối cảnh học tập hoặc khi phát triển một sản phẩm ở giai đoạn ban đầu, mô hình này thường được lựa chọn vì đơn giản, dễ hiểu và có tốc độ khởi động nhanh.

Trong hệ thống thương mại điện tử, một ứng dụng monolithic thường bao gồm nhiều module như quản lý người dùng, danh mục sản phẩm, giỏ hàng, đặt hàng, thanh toán, báo cáo và các thành phần hỗ trợ marketing. Về mặt source code, các phần này có thể được tổ chức thành thư mục hoặc package riêng, nhưng khi chạy, chúng vẫn phụ thuộc vào cùng một runtime và thường cùng dùng một cơ sở dữ liệu tập trung. Điều này dẫn đến việc ranh giới nghiệp vụ tuy tồn tại trên lý thuyết nhưng không được cô lập đủ mạnh ở mức triển khai.

### 1.1.2 Cấu trúc điển hình
Một hệ thống monolithic điển hình có thể được chia thành ba lớp phổ biến:

- Presentation Layer: nơi tiếp nhận yêu cầu từ người dùng, bao gồm giao diện web hoặc REST API.
- Business Logic Layer: nơi chứa quy tắc nghiệp vụ như kiểm tra tồn kho, tính tổng tiền, xác nhận đơn hàng, xác thực người dùng.
- Data Access Layer: nơi truy cập database thông qua ORM hoặc câu lệnh SQL.

Về bản chất, dù được phân lớp, toàn bộ các lớp này vẫn nằm trong một ứng dụng duy nhất. Khi cần thay đổi ở một phần, ví dụ cập nhật logic thanh toán, toàn bộ hệ thống thường phải được build và deploy lại. Nếu số lượng tính năng ít và các domain chưa quá lớn, điều này vẫn chấp nhận được. Tuy nhiên, khi ứng dụng bắt đầu phát triển, đặc biệt là khi nhiều nhóm làm việc song song, giới hạn của kiến trúc monolithic sẽ trở nên rõ rệt.

### 1.1.3 Ưu điểm của monolithic ở giai đoạn đầu
Monolithic không phải là một kiến trúc “xấu”. Trên thực tế, nó có nhiều ưu điểm ở giai đoạn khởi đầu của sản phẩm:

- Đơn giản về mặt triển khai.
- Dễ debug vì mọi thành phần nằm chung một nơi.
- Không phát sinh chi phí giao tiếp mạng giữa các module.
- Dễ thiết lập môi trường phát triển cho nhóm nhỏ.
- Phù hợp khi nghiệp vụ còn đơn giản hoặc chưa ổn định.

Đối với một dự án học phần hoặc MVP, monolithic cho phép nhóm tập trung trước vào chức năng cốt lõi thay vì giải quyết sớm các vấn đề phân tán như service discovery, retry, timeout hay consistency giữa nhiều database.

### 1.1.4 Hạn chế khi hệ thống tăng trưởng
Khi quy mô hệ thống tăng lên, monolithic dần bộc lộ những hạn chế:

1. Coupling cao giữa các module. Một thay đổi nhỏ trong một phần có thể kéo theo rủi ro ở các phần khác.
2. Khó mở rộng theo chiều ngang cho từng chức năng riêng lẻ. Nếu chỉ một module chịu tải cao, ví dụ tìm kiếm sản phẩm, vẫn phải scale toàn bộ ứng dụng.
3. Quy trình deploy trở nên rủi ro hơn vì bất kỳ thay đổi nào cũng ảnh hưởng tới cả hệ thống.
4. Database dùng chung làm ranh giới dữ liệu giữa các module trở nên mờ nhạt, khiến sự phụ thuộc tăng dần theo thời gian.
5. Khó đưa các công nghệ đặc thù như AI hoặc real-time processing vào mà không làm tăng đáng kể độ phức tạp của codebase.

Trong một hệ thống thương mại điện tử hiện đại, nơi frontend, backend nghiệp vụ, recommendation, search và chatbot có nhu cầu công nghệ khác nhau, monolithic thường không còn là lựa chọn tối ưu cho giai đoạn mở rộng lâu dài.

## 1.2 Microservices Architecture

### 1.2.1 Khái niệm
Microservices là kiến trúc phân chia hệ thống thành nhiều dịch vụ nhỏ, độc lập, mỗi dịch vụ phụ trách một phạm vi nghiệp vụ cụ thể. Mỗi service có thể được phát triển, kiểm thử, triển khai và mở rộng độc lập. Thay vì một ứng dụng lớn bao trùm tất cả chức năng, hệ thống sẽ được tổ chức thành một tập hợp các thành phần chuyên trách, giao tiếp với nhau thông qua API hoặc message broker.

Trong TechStore, hướng tiếp cận microservices đặc biệt phù hợp vì hệ thống có nhiều miền nghiệp vụ khác nhau: xác thực người dùng, quản lý catalog sản phẩm, giỏ hàng, đặt hàng, thanh toán và trí tuệ nhân tạo. AI Service có yêu cầu kỹ thuật khác biệt rõ rệt so với các service CRUD truyền thống, do đó việc tách nó thành một service riêng là hợp lý về cả kiến trúc lẫn vận hành.

### 1.2.2 Đặc điểm cốt lõi
Một số đặc điểm cốt lõi của microservices bao gồm:

- Single Responsibility ở mức service: mỗi service chịu trách nhiệm cho một phần nghiệp vụ rõ ràng.
- Database-per-Service: mỗi service quản lý dữ liệu riêng của mình.
- Deploy độc lập: service có thể được cập nhật riêng mà không cần phát hành lại toàn hệ thống.
- Fault isolation: lỗi ở một service không nhất thiết làm sập toàn bộ hệ thống.
- Polyglot architecture: các service khác nhau có thể sử dụng ngôn ngữ, framework hoặc thư viện khác nhau.

### 1.2.3 Ưu điểm
Đối với TechStore, microservices mang lại nhiều lợi ích thực tế:

- Cho phép tách rõ nghiệp vụ và phân chia trách nhiệm giữa các phần của hệ thống.
- Tạo điều kiện để AI Service sử dụng FastAPI, PyTorch và FAISS trong khi các service nghiệp vụ dùng Django REST Framework.
- Hỗ trợ mở rộng riêng các service chịu tải lớn, ví dụ product-service hoặc ai-service.
- Giảm rủi ro khi triển khai thay đổi ở một service.
- Phù hợp với phương pháp phát triển theo nhóm, nơi mỗi thành viên có thể tập trung vào một bounded context cụ thể.

### 1.2.4 Nhược điểm và thách thức
Tuy nhiên, microservices không làm cho hệ thống đơn giản hơn. Trái lại, nó làm cho hệ thống phân tán hơn, từ đó xuất hiện nhiều thách thức mới:

- Quản lý nhiều service, nhiều database và nhiều cấu hình môi trường.
- Tăng độ phức tạp khi debug vì lỗi có thể nằm ở luồng giao tiếp chứ không chỉ trong code nội bộ.
- Cần xử lý timeout, retry, circuit breaker và graceful degradation.
- Dữ liệu bị phân tán, đòi hỏi thiết kế nghiệp vụ cẩn thận để tránh inconsistency.
- Việc test end-to-end phức tạp hơn so với monolithic.

Nói cách khác, microservices là lựa chọn đánh đổi giữa tính linh hoạt và độ phức tạp vận hành. Kiến trúc này chỉ thực sự hiệu quả khi việc phân rã nghiệp vụ được thực hiện đúng và nhóm phát triển có kỷ luật tổ chức hệ thống tốt.

### 1.2.5 So sánh Monolithic và Microservices

| Tiêu chí | Monolithic | Microservices |
|---|---|---|
| Đơn vị triển khai | Một gói duy nhất | Nhiều service riêng |
| Database | Thường dùng chung | Mỗi service một database |
| Scale | Scale cả hệ thống | Scale theo từng service |
| Đổi công nghệ | Khó | Linh hoạt hơn |
| Độ phức tạp hạ tầng | Thấp | Cao |
| Fault isolation | Kém hơn | Tốt hơn |
| Tốc độ khởi đầu | Nhanh | Chậm hơn |
| Phù hợp với AI service riêng | Kém linh hoạt | Rất phù hợp |

## 1.3 Domain-Driven Design (DDD)

### 1.3.1 Mục tiêu của DDD
DDD giúp mô hình hóa hệ thống dựa trên nghiệp vụ thực tế thay vì tổ chức thuần theo lớp kỹ thuật. Mục tiêu quan trọng nhất của DDD là xác định được ngôn ngữ chung giữa người thiết kế hệ thống và người hiểu nghiệp vụ, từ đó xây dựng mô hình phản ánh đúng những gì hệ thống thực sự cần làm.

Trong thương mại điện tử, nếu chỉ chia code theo controller, service, repository mà không nhận diện đúng domain, hệ thống rất dễ trở thành một tập hợp technical layer khó mở rộng. DDD giúp chuyển trọng tâm sang các khái niệm nghiệp vụ như user, product, cart, order, payment và recommendation.

### 1.3.2 Các khái niệm quan trọng
Các khái niệm tiêu biểu trong DDD gồm:

- Entity: đối tượng có định danh riêng, ví dụ `User`, `Product`, `Order`.
- Value Object: đối tượng không cần định danh riêng, được so sánh theo giá trị, ví dụ địa chỉ giao hàng.
- Aggregate: nhóm entity và value object liên quan, được quản lý thống nhất bởi aggregate root.
- Domain Service: chứa logic nghiệp vụ không phù hợp để đặt trong một entity cụ thể.
- Repository: trừu tượng hóa việc truy cập và lưu aggregate.
- Bounded Context: ranh giới mà trong đó mô hình và thuật ngữ được hiểu nhất quán.

### 1.3.3 Bounded Context và Context Map
Bounded Context là khái niệm trung tâm của DDD khi thiết kế microservices. Một số khái niệm có thể xuất hiện ở nhiều nơi nhưng mang ý nghĩa khác nhau tùy context. Ví dụ “user” trong context xác thực có thể tập trung vào account và role, trong khi “user” trong context recommendation chủ yếu chỉ là một định danh để gom hành vi.

Context Map là cách mô tả mối quan hệ giữa các bounded context. Trong một hệ thống lớn, nó giúp trả lời các câu hỏi như:

- Context nào phụ thuộc vào context nào?
- Dữ liệu được trao đổi qua API nào?
- Context nào là nguồn chân lý cho một loại dữ liệu?

### 1.3.4 Vai trò của DDD trong Microservices
Microservices nếu không gắn với DDD rất dễ bị chia sai. Một hệ thống có thể được “xé nhỏ” thành nhiều service nhưng không hề tốt hơn nếu việc chia nhỏ đó chỉ dựa trên technical layer hoặc cảm tính. DDD giúp:

- Xác định ranh giới service theo nghiệp vụ thực tế.
- Tránh shared database và shared model không cần thiết.
- Giảm coupling logic giữa các thành phần.
- Tăng khả năng mở rộng đúng chỗ.

## 1.4 Áp dụng DDD vào hệ thống TechStore

### 1.4.1 Phân tích bài toán
TechStore là một hệ thống bán hàng trực tuyến có những nghiệp vụ chính sau:

- quản lý người dùng và xác thực,
- hiển thị catalog sản phẩm,
- quản lý giỏ hàng,
- tạo đơn hàng,
- thanh toán,
- tư vấn sản phẩm bằng AI.

Những nghiệp vụ này tuy liên quan với nhau trong luồng người dùng, nhưng không nhất thiết phải cùng nằm trong một khối triển khai. Đây là cơ sở để tiến hành phân rã.

### 1.4.2 Xác định domain và subdomain
Các domain chính của TechStore bao gồm:

- User Domain
- Product Domain
- Cart Domain
- Order Domain
- Payment Domain
- AI Domain

Trong đó, AI Domain có thể xem là một supporting domain mang tính khác biệt về công nghệ nhưng đóng vai trò ngày càng quan trọng trong trải nghiệm người dùng.

### 1.4.3 Xác định bounded context
Sau khi phân tích nghiệp vụ, hệ thống được chia thành các bounded context như sau:

| Bounded Context | Mô tả |
|---|---|
| User Context | Đăng ký, đăng nhập, JWT, profile, vai trò |
| Product Context | Danh sách sản phẩm, category, thông tin catalog |
| Cart Context | Trạng thái giỏ hàng của người dùng |
| Order Context | Tạo đơn hàng, quản lý item trong đơn |
| Payment Context | Xử lý giao dịch thanh toán mock |
| AI Context | Recommendation và chatbot |

### 1.4.4 Ánh xạ bounded context sang microservice
Ánh xạ từ bounded context sang microservice của TechStore:

| Context | Service |
|---|---|
| User Context | `user-service` |
| Product Context | `product-service` |
| Cart Context | `cart-service` |
| Order Context | `order-service` |
| Payment Context | `payment-service` |
| AI Context | `ai-service` |

Việc ánh xạ này hợp lý vì mỗi service có ranh giới nghiệp vụ rõ ràng, dễ hiểu và không chồng lấn quá mức với service khác.

## 1.5 Kết luận chương 1
Chương 1 trình bày nền tảng lý thuyết cho toàn bộ hệ thống TechStore. Từ việc phân tích giới hạn của monolithic, bài tiểu luận chỉ ra lý do lựa chọn microservices như một hướng đi phù hợp cho hệ thống thương mại điện tử có tích hợp AI. Đồng thời, DDD được sử dụng như cơ sở để thực hiện phân rã nghiệp vụ một cách có tổ chức, thay vì chia hệ thống theo cảm tính hoặc chỉ theo kỹ thuật.

---

# CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE MICROSERVICES

## 2.1 Xác định yêu cầu hệ thống

### 2.1.1 Functional Requirements
Để phản ánh đầy đủ một nền tảng bán hàng cơ bản có tích hợp AI, TechStore được xây dựng với các yêu cầu chức năng chính sau:

1. Người dùng có thể đăng ký, đăng nhập và quản lý hồ sơ cá nhân.
2. Người dùng có thể duyệt danh sách sản phẩm, xem chi tiết và lọc theo nhu cầu.
3. Người dùng có thể thêm sản phẩm vào giỏ hàng, thay đổi số lượng hoặc xóa sản phẩm.
4. Người dùng có thể tạo đơn hàng từ giỏ hàng.
5. Hệ thống có thể mô phỏng bước thanh toán để hoàn tất luồng mua hàng.
6. Người dùng có thể nhận gợi ý sản phẩm dựa trên hành vi gần đây.
7. Người dùng có thể đặt câu hỏi bằng ngôn ngữ tự nhiên để chatbot tư vấn sản phẩm.

Những yêu cầu này phản ánh một hệ thống vừa có nghiệp vụ thương mại điện tử cơ bản, vừa có lớp AI bổ sung trải nghiệm cá nhân hóa.

### 2.1.2 Non-functional Requirements
Bên cạnh chức năng, hệ thống còn cần đáp ứng các yêu cầu phi chức năng:

- Khả năng triển khai đồng nhất bằng Docker.
- Kiến trúc dễ mở rộng theo từng service.
- Xác thực người dùng nhất quán bằng JWT.
- Tách dữ liệu giữa các service để giảm coupling.
- Có thể kiểm thử từng thành phần và kiểm thử tích hợp.
- AI Service có thể vận hành độc lập với phần backend CRUD.

Các yêu cầu phi chức năng này đóng vai trò rất lớn trong việc định hình kiến trúc tổng thể của hệ thống.

## 2.2 Kiến trúc tổng thể hệ thống

### 2.2.1 Danh sách microservice
Hệ thống hiện tại bao gồm các thành phần chính sau:

| Service | Công nghệ | Cổng nội bộ | Cơ sở dữ liệu | Vai trò |
|---|---|---:|---|---|
| `user-service` | Django + DRF | 8001 | PostgreSQL | Người dùng, xác thực |
| `product-service` | Django + DRF | 8002 | PostgreSQL | Catalog sản phẩm |
| `cart-service` | Django + DRF | 8003 | PostgreSQL | Giỏ hàng |
| `order-service` | Django + DRF | 8004 | PostgreSQL | Đơn hàng |
| `payment-service` | Django + DRF | 8005 | PostgreSQL | Thanh toán mock |
| `ai-service` | FastAPI | 5000 | Không bắt buộc DB riêng | AI recommendation và chatbot |
| `frontend` | React + Vite + Nginx | 80 | Không áp dụng | Giao diện người dùng |
| `gateway` | Nginx | 80 | Không áp dụng | API Gateway |

Kiến trúc này thể hiện rõ chủ đích tách biệt giữa frontend, gateway, các service nghiệp vụ và AI service.

### 2.2.2 Database-per-Service Pattern
Database-per-Service là một nguyên tắc trọng tâm của kiến trúc hiện tại. Mỗi service nghiệp vụ có một cơ sở dữ liệu PostgreSQL riêng, ví dụ `user_db`, `product_db`, `cart_db`, `order_db`, `payment_db`. Điều này giúp:

- tránh việc các service truy cập chéo schema dữ liệu,
- bảo vệ ranh giới domain,
- cho phép tối ưu từng database theo nhu cầu riêng,
- hạn chế việc một thay đổi trong schema gây ảnh hưởng rộng.

Đổi lại, hệ thống phải chấp nhận rằng không còn một giao dịch ACID xuyên suốt toàn bộ hệ thống theo kiểu monolithic. Thay vào đó, tính nhất quán cần được quản lý ở mức quy trình nghiệp vụ và API contract.

### 2.2.3 API Gateway
Gateway của TechStore được triển khai bằng Nginx. Đây là điểm vào duy nhất đối với phần lớn request từ frontend. Gateway đảm nhận các nhiệm vụ:

- định tuyến request đến đúng service theo path,
- ẩn topology nội bộ của backend khỏi frontend,
- tạo một entry point thống nhất cho hệ thống,
- hỗ trợ sau này cho các nhu cầu như logging tập trung, rate limiting hoặc SSL termination.

Ví dụ các nhóm path phổ biến:

- `/api/users/` hoặc `/api/auth/` tới `user-service`,
- `/api/products/` tới `product-service`,
- `/api/cart/` tới `cart-service`,
- `/api/orders/` tới `order-service`,
- `/api/payments/` tới `payment-service`,
- `/api/ai/` tới `ai-service`.

### 2.2.4 Chia sẻ trách nhiệm giữa frontend và backend
Frontend chịu trách nhiệm về trải nghiệm người dùng, điều hướng màn hình, lưu giữ token và gọi API. Backend chịu trách nhiệm xử lý nghiệp vụ, xác thực, dữ liệu và AI. Sự phân chia này giúp kiến trúc rõ ràng hơn và làm giảm coupling giữa giao diện và logic nghiệp vụ.

## 2.3 Thiết kế chi tiết từng service

### 2.3.1 User Service
User Service là nơi quản lý tài khoản người dùng và luồng xác thực. Trong code hiện tại, service này được triển khai bằng Django REST Framework. Vai trò chính của nó là:

- đăng ký người dùng,
- đăng nhập,
- phát hành JWT,
- lưu trữ thông tin cơ bản của tài khoản,
- phân biệt vai trò quản trị và người dùng thường.

Tách user thành một service riêng giúp phần xác thực trở thành một bounded context độc lập. Khi logic người dùng thay đổi, ví dụ mở rộng role hoặc thêm cơ chế xác minh email, phạm vi tác động sẽ được cô lập tương đối tốt.

### 2.3.2 Product Service
Product Service quản lý catalog sản phẩm và là một trong những thành phần có lưu lượng truy cập lớn nhất từ frontend. Đây là nguồn dữ liệu đầu vào cho cả giao diện người dùng lẫn AI service. Các nhiệm vụ chính của Product Service:

- lưu thông tin sản phẩm,
- cung cấp API liệt kê và xem chi tiết,
- hỗ trợ lọc hoặc truy vấn theo điều kiện cần thiết,
- cung cấp dữ liệu để AI service xây dựng RAG index.

Một đặc điểm quan trọng là Product Service đóng vai trò “nguồn chân lý” cho thông tin catalog, giúp tránh việc nhiều service cùng nắm giữ phiên bản sản phẩm mâu thuẫn nhau.

### 2.3.3 Cart Service
Cart Service quản lý trạng thái giỏ hàng của người dùng. Việc tách thành service riêng giúp nghiệp vụ giỏ hàng độc lập với order và product. Các thao tác điển hình gồm:

- thêm sản phẩm vào giỏ,
- cập nhật số lượng,
- xem toàn bộ giỏ hàng,
- xóa sản phẩm khỏi giỏ.

Trong luồng checkout, Cart Service là nơi Order Service cần truy vấn để lấy danh sách các mặt hàng mà người dùng đang chọn mua.

### 2.3.4 Order Service
Order Service là trung tâm điều phối của quy trình mua hàng. Nó tiếp nhận yêu cầu checkout, phối hợp với Cart Service và Payment Service, sau đó lưu đơn hàng vào database riêng. Đây là nơi nghiệp vụ quan trọng nhất của một hệ thống bán hàng được thể hiện rõ:

- xác lập thời điểm người dùng thật sự “đặt hàng”,
- ghi nhận item trong đơn,
- quản lý trạng thái đơn hàng,
- phối hợp với các dịch vụ liên quan.

Trong kiến trúc phân tán, Order Service thường là nơi cần được thiết kế rất cẩn thận vì nó nằm ở giao điểm của nhiều context.

### 2.3.5 Payment Service
Payment Service trong TechStore hiện đang là service thanh toán mock. Dù đơn giản, việc tách service này vẫn có ý nghĩa lớn vì:

- mô hình hóa rõ ràng bước thanh toán như một domain riêng,
- tạo điều kiện để sau này thay thế bằng cổng thanh toán thật,
- giữ cho Order Service không ôm toàn bộ logic liên quan tới giao dịch.

Trong môi trường học thuật, cách tiếp cận mock payment là đủ để thể hiện luồng nghiệp vụ end-to-end mà không làm tăng độ phức tạp tích hợp với bên thứ ba.

### 2.3.6 AI Service
AI Service là phần tạo ra khác biệt cho TechStore. Service này được viết bằng FastAPI, sử dụng các thư viện như PyTorch, pandas, numpy, scikit-learn và FAISS để giải quyết hai bài toán:

- recommendation dựa trên hành vi,
- chatbot tư vấn sản phẩm.

Việc tách AI Service thành một microservice riêng thay vì nhúng vào một Django service mang lại nhiều lợi ích:

- dễ tối ưu dependency AI,
- không làm nặng runtime của các service CRUD,
- có thể phát triển mô hình hoặc pipeline AI độc lập,
- phù hợp với khả năng scale riêng nếu lượng request AI tăng.

## 2.4 Thiết kế dữ liệu và mô hình triển khai

### 2.4.1 Cấu trúc database
Hiện tại, 5 service nghiệp vụ chính đều có PostgreSQL riêng. Cách tổ chức này giúp dữ liệu có chủ sở hữu rõ ràng. Chẳng hạn:

- dữ liệu người dùng nằm trong `user-service`,
- sản phẩm nằm trong `product-service`,
- cart items nằm trong `cart-service`,
- orders nằm trong `order-service`,
- payment records nằm trong `payment-service`.

### 2.4.2 Tính độc lập dữ liệu giữa các service
Không service nào được phép coi database của service khác như “kho dữ liệu tiện lợi”. Nếu Order Service cần dữ liệu cart, nó phải gọi API của Cart Service. Nếu AI Service cần thông tin catalog, nó phải đọc từ nguồn dữ liệu phù hợp hoặc dùng bản dữ liệu được build riêng cho nó. Đây là yếu tố giữ cho kiến trúc microservices không bị thoái hóa ngược về shared database.

### 2.4.3 Ràng buộc và nhất quán dữ liệu
Tách database làm tăng độ khó của bài toán nhất quán dữ liệu. Ví dụ, khi tạo đơn hàng:

1. cart-service nắm cart items,
2. order-service tạo bản ghi order,
3. payment-service ghi nhận thanh toán,
4. trạng thái cuối cùng của luồng nghiệp vụ phụ thuộc vào nhiều thành phần.

Trong hệ thống hiện tại, mức độ nhất quán được đảm bảo chủ yếu bằng luồng xử lý nghiệp vụ đồng bộ và mock payment. Về lâu dài, nếu mở rộng hệ thống, các pattern như saga hoặc outbox có thể cần được xem xét.

## 2.5 Luồng nghiệp vụ toàn hệ thống

### 2.5.1 Use case mua hàng end-to-end
Một luồng mua hàng tiêu biểu của TechStore diễn ra như sau:

1. Người dùng đăng nhập và nhận JWT.
2. Frontend gọi Product Service qua gateway để hiển thị danh sách sản phẩm.
3. Người dùng chọn sản phẩm và thêm vào giỏ hàng.
4. Frontend gọi Cart Service để lưu cart items.
5. Khi checkout, frontend gọi Order Service.
6. Order Service lấy dữ liệu giỏ hàng, tính tổng và gọi Payment Service.
7. Payment Service trả về trạng thái thành công giả lập.
8. Order Service lưu order và trả kết quả cho frontend.

Luồng này tuy được mô phỏng đơn giản nhưng đủ minh họa sự phối hợp giữa nhiều service trong một nghiệp vụ cốt lõi.

### 2.5.2 Luồng đăng nhập và xác thực
Luồng xác thực bằng JWT diễn ra như sau:

1. Người dùng gửi username/password tới User Service.
2. User Service kiểm tra thông tin đăng nhập.
3. Nếu hợp lệ, hệ thống trả `access token` và `refresh token`.
4. Frontend lưu token và gửi kèm trong các request tiếp theo.
5. Backend dựa vào token để nhận diện người dùng hiện tại.

JWT phù hợp với hệ thống phân tán vì nó giảm nhu cầu lưu session tập trung ở server.

### 2.5.3 Luồng truy vấn recommendation
Luồng AI recommendation có thể được mô tả như sau:

1. Frontend hoặc chatbot yêu cầu recommendation cho một `user_id`.
2. AI Service đọc lịch sử hành vi gần nhất.
3. Sequence model dự đoán xác suất sản phẩm tiếp theo.
4. Graph signal bổ sung mối quan hệ chuyển tiếp và similarity.
5. RAG bổ sung điểm liên quan theo nội dung truy vấn.
6. Hệ thống tính hybrid score và trả về danh sách sản phẩm xếp hạng.

## 2.6 Đánh giá kiến trúc chương 2
Kiến trúc của TechStore đạt được mục tiêu chính của một hệ thống microservices ở mức học thuật và demo:

- dịch vụ được phân tách tương đối rõ,
- gateway và database-per-service được áp dụng,
- AI service độc lập,
- frontend có thể tương tác với toàn bộ hệ thống qua entry point thống nhất.

Tuy nhiên, đây chưa phải là một kiến trúc production hoàn chỉnh ở quy mô lớn. Những thiếu hụt như observability, circuit breaker, message broker và cơ chế nhất quán nâng cao vẫn là các hướng cần bổ sung.

## 2.7 Kết luận chương 2
Chương 2 trình bày cụ thể cách hệ thống TechStore được thiết kế thành các microservice và cách các thành phần đó phối hợp trong các luồng nghiệp vụ quan trọng. Đây là phần cho thấy cơ sở lý thuyết từ chương 1 đã được chuyển hóa thành một cấu trúc triển khai thực tế, có thể chạy, kiểm tra và mở rộng.

---

# CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM

## 3.1 Mục tiêu và kiến trúc AI Service

### 3.1.1 Bài toán recommendation
Recommendation trong TechStore hướng tới bài toán dự đoán sản phẩm tiếp theo mà người dùng có khả năng quan tâm dựa trên chuỗi hành vi gần nhất. Đây không đơn thuần là bài toán “sản phẩm bán chạy nhất”, mà là bài toán tận dụng tín hiệu cá nhân hóa từ hành vi view, click và add-to-cart.

### 3.1.2 Bài toán chatbot
Bên cạnh recommendation, hệ thống còn cần một chatbot có khả năng tư vấn sản phẩm bằng ngôn ngữ tự nhiên. Chatbot phải trả lời được các câu hỏi như người dùng cần laptop học tập, điện thoại chụp ảnh đẹp hay tai nghe giá phù hợp. Để làm được điều đó, hệ thống cần không chỉ một LLM mà còn cần cơ chế retrieval để đưa được dữ liệu sản phẩm thực tế vào ngữ cảnh trả lời.

### 3.1.3 Kiến trúc thực tế của AI Service
AI Service trong TechStore hiện bao gồm các thành phần chính:

- `app/main.py`: khởi tạo FastAPI và định nghĩa endpoint.
- `app/recommendation.py`: xử lý sequence model, graph signal và hybrid scoring.
- `app/rag_retrieve.py`: xây dựng index retrieval bằng TF-IDF và FAISS.
- `app/gemini_client.py`: tích hợp LLM ngoài.
- `app/fallback.py`: sinh phản hồi thay thế khi LLM ngoài không khả dụng.
- `app/synthetic_behavior.py`: hỗ trợ sinh dữ liệu hành vi synthetic cho mục tiêu minh họa và huấn luyện.

Kiến trúc này cho phép AI Service vừa phục vụ recommendation, vừa phục vụ chatbot mà vẫn giữ được tính mô-đun bên trong.

## 3.2 Dữ liệu hành vi người dùng

### 3.2.1 Cấu trúc file dữ liệu
Dữ liệu hành vi chính được lưu dưới dạng CSV. Mỗi bản ghi bao gồm:

- `user_id`: định danh người dùng,
- `product_id`: định danh sản phẩm,
- `action`: loại tương tác,
- `timestamp`: thời điểm xảy ra tương tác.

Đây là cấu trúc đơn giản nhưng đủ để xây dựng bài toán sequence prediction. Dù chưa phải dữ liệu production đầy đủ, định dạng này giúp pipeline recommendation được hiện thực hóa một cách rõ ràng và dễ kiểm tra.

### 3.2.2 Chuẩn hóa action
Trong code, các action được chuẩn hóa về các giá trị cốt lõi như `view`, `click`, `add_to_cart`. Điều này giúp mô hình giảm nhiễu từ các biến thể dữ liệu đầu vào và tập trung vào những tín hiệu hành vi quan trọng nhất. Mỗi action sau đó được ánh xạ thành index số để có thể đưa vào embedding layer.

### 3.2.3 Tạo sequence dataset
Sau khi chuẩn hóa, dữ liệu được sắp xếp theo `user_id` và `timestamp`. Với mỗi người dùng, hệ thống tạo ra các cửa sổ hành vi có kích thước `window_size = 5`. Mỗi cửa sổ đại diện cho 5 tương tác gần nhất, còn nhãn là sản phẩm tiếp theo mà người dùng tương tác. Đây là cách chuyển dữ liệu từ dạng log hành vi sang dạng bài toán supervised learning cho sequence model.

### 3.2.4 Vai trò của dữ liệu synthetic
Một vấn đề thường gặp trong đồ án và dự án học thuật là thiếu dữ liệu thật hoặc dữ liệu thật không đủ sạch để mô hình học ra pattern có ý nghĩa. Trong TechStore, dữ liệu gốc có tính ngẫu nhiên tương đối cao nên metric của mô hình sequence thấp. Vì vậy, nhóm đã bổ sung khả năng tạo dữ liệu synthetic có pattern rõ ràng hơn phục vụ mục đích:

- minh họa khả năng học của mô hình,
- kiểm tra pipeline huấn luyện end-to-end,
- tạo kết quả đủ trực quan để trình bày trong notebook và báo cáo.

Việc sử dụng dữ liệu synthetic cần được nêu rõ trong báo cáo để tránh tạo cảm giác mô hình đạt độ chính xác cao trên dữ liệu thực.

## 3.3 Sequence Modeling với RNN, LSTM và biLSTM

### 3.3.1 Ý tưởng chung
Ý tưởng cốt lõi của sequence modeling trong TechStore là: nếu biết 5 hành vi gần nhất của người dùng, có thể dự đoán sản phẩm tiếp theo mà người đó có khả năng quan tâm. Đầu vào không chỉ là `product_id`, mà còn bao gồm `action` tương ứng. Do đó, mỗi bước thời gian trong chuỗi mang thông tin kép:

- sản phẩm mà người dùng tương tác,
- loại tương tác mà người dùng thực hiện.

Hệ thống dùng embedding riêng cho product và action, sau đó ghép chúng lại thành vector đặc trưng cho mỗi timestep.

### 3.3.2 Kiến trúc RNN
RNN là mô hình cơ sở nhất trong ba mô hình sequence được triển khai. Trong TechStore, RNN được cài bằng `torch.nn.RNN`. RNN có khả năng nhớ ngắn hạn nhờ hidden state được truyền qua các bước thời gian. Ưu điểm của RNN là:

- cấu trúc đơn giản,
- dễ cài đặt,
- tốc độ xử lý tương đối nhanh.

Tuy nhiên, nhược điểm của RNN là khả năng nắm bắt phụ thuộc dài hạn kém hơn các biến thể như LSTM. Điều này đặc biệt đúng khi chuỗi hành vi có tính đa dạng cao hoặc khi tín hiệu quan trọng xuất hiện ở đầu chuỗi.

### 3.3.3 Kiến trúc LSTM
LSTM được thiết kế để giải quyết nhược điểm vanishing gradient của RNN thông thường. Bằng cách bổ sung cell state và các cơ chế gate, LSTM cho phép mô hình lựa chọn thông tin nào nên nhớ, thông tin nào nên quên và thông tin nào nên đưa ra đầu ra. Trong bối cảnh recommendation:

- LSTM phù hợp hơn khi hành vi người dùng có phụ thuộc theo thời gian,
- có khả năng giữ ngữ cảnh tốt hơn,
- thường cho kết quả ổn định hơn RNN cơ bản.

Trong code hiện tại, LSTM được triển khai bằng `torch.nn.LSTM` và sử dụng embedding giống như mô hình RNN.

### 3.3.4 Kiến trúc biLSTM
biLSTM là phiên bản hai chiều của LSTM, cho phép mô hình xử lý chuỗi theo cả hướng tiến và hướng lùi. Trong một số bài toán ngôn ngữ tự nhiên, đây là kỹ thuật rất mạnh vì nó tận dụng ngữ cảnh hai phía. Với bài toán recommendation trong TechStore, biLSTM chủ yếu được dùng để so sánh và đánh giá mô hình. Trong notebook synthetic hiện tại, biLSTM thường cho kết quả tốt nhất trong ba mô hình sequence.

### 3.3.5 Quy trình huấn luyện và đánh giá
Quy trình huấn luyện sequence model gồm các bước:

1. Tạo dataset từ log hành vi.
2. Chia train/validation từ chính sequence dataset.
3. Tạo model tương ứng với `rnn`, `lstm` hoặc `bilstm`.
4. Tối ưu bằng `Adam`.
5. Dùng `CrossEntropyLoss` để học bài toán phân loại sản phẩm tiếp theo.
6. Đánh giá bằng `top1_accuracy` và `top5_accuracy`.
7. Lưu artifact mô hình để tái sử dụng khi service khởi động.

Việc lưu model cache vào thư mục `data/artifacts/` giúp AI Service không phải train lại mỗi lần start, nhờ đó giảm thời gian khởi động và ổn định môi trường demo.

## 3.4 Graph Signal và quan hệ sản phẩm

### 3.4.1 Graph in-memory
Sequence model chỉ là một phần của recommendation. TechStore còn bổ sung graph signal dựa trên các chuyển tiếp sản phẩm trong hành vi người dùng. Nếu nhiều người thường xem hoặc tương tác sản phẩm A rồi tới sản phẩm B, hệ thống có thể coi đó là một tín hiệu liên kết có giá trị. Trong code, graph signal này được xây bằng cấu trúc in-memory dựa trên `pandas` và các map Python.

### 3.4.2 Similarity theo category và brand
Ngoài chuyển tiếp trực tiếp, graph signal còn tận dụng similarity theo:

- category,
- brand.

Nếu hai sản phẩm cùng category hoặc cùng brand, hệ thống cộng thêm điểm tương quan. Cách làm này tạo ra một lớp “tri thức nhẹ” giúp recommendation không phụ thuộc hoàn toàn vào mô hình học chuỗi.

### 3.4.3 Hỗ trợ Neo4j
Mặc dù mặc định chạy bằng graph in-memory, code của TechStore cũng hỗ trợ đồng bộ dữ liệu sang Neo4j nếu môi trường có cấu hình phù hợp. Điều này cho thấy thiết kế đã tính đến khả năng mở rộng trong tương lai:

- hiện tại có thể chạy nhẹ nhàng không cần graph database thật,
- về sau có thể chuyển sang Neo4j để tận dụng truy vấn graph phong phú hơn.

## 3.5 RAG với TF-IDF và FAISS

### 3.5.1 Xây dựng biểu diễn văn bản sản phẩm
Để chatbot và recommendation có thể tận dụng ngữ nghĩa nội dung sản phẩm, hệ thống xây dựng biểu diễn văn bản cho mỗi item từ các trường:

- tên sản phẩm,
- mô tả,
- thương hiệu,
- danh mục.

Các trường này được ghép thành một chuỗi mô tả thống nhất, làm đầu vào cho bước vector hóa.

### 3.5.2 Tạo index vector
Hệ thống sử dụng TF-IDF để biến văn bản thành vector sparse, sau đó chuẩn hóa và nạp vào FAISS `IndexFlatIP`. Cách tiếp cận này có ưu điểm:

- nhẹ,
- dễ triển khai,
- không phụ thuộc vào model embedding lớn,
- phù hợp với phạm vi đồ án.

Tuy không hiện đại bằng các hệ embedding dense mới, giải pháp này đáp ứng tốt mục tiêu minh họa RAG trong một hệ thống có thể chạy thực tế trên máy phát triển thông thường.

### 3.5.3 Truy hồi sản phẩm liên quan
Khi người dùng đặt câu hỏi, ví dụ “tôi cần laptop học tập pin tốt”, hệ thống sẽ:

1. biến đổi truy vấn thành vector TF-IDF,
2. tìm top-k sản phẩm gần nhất trong FAISS,
3. dùng kết quả đó như ngữ cảnh cho bước trả lời chatbot hoặc như một nguồn điểm bổ sung trong recommendation.

Đây là phần làm cho AI Service không còn chỉ là mô hình dự đoán chuỗi, mà trở thành một thành phần có thể kết nối hành vi với nội dung sản phẩm.

## 3.6 Hybrid Scoring

### 3.6.1 Công thức tính điểm
TechStore kết hợp nhiều nguồn tín hiệu bằng một công thức hybrid:

`final_score = w1 * rnn + w2 * lstm + w3 * bilstm + w4 * graph + w5 * rag`

Mỗi thành phần đóng góp một góc nhìn khác nhau:

- sequence models học từ chuỗi hành vi,
- graph phản ánh quan hệ chuyển tiếp và similarity,
- RAG phản ánh độ liên quan ngữ nghĩa theo truy vấn.

### 3.6.2 Ý nghĩa của từng thành phần
Từng thành phần trong công thức hybrid có thể được hiểu như sau:

- `rnn`: tín hiệu cơ sở nhanh và đơn giản.
- `lstm`: tín hiệu giữ ngữ cảnh tốt hơn.
- `bilstm`: tín hiệu sequence mạnh nhất trong nhóm ba mô hình.
- `graph`: tín hiệu dựa trên mối liên kết giữa sản phẩm.
- `rag`: tín hiệu gắn với ngữ nghĩa mô tả sản phẩm và truy vấn.

Việc kết hợp này làm giảm rủi ro khi chỉ dựa vào một mô hình đơn lẻ. Nếu sequence model yếu vì dữ liệu hành vi nghèo nàn, graph và RAG vẫn có thể đóng góp vào kết quả.

### 3.6.3 Giải thích tính minh bạch của kết quả
Một ưu điểm của hệ thống hiện tại là response recommendation có thể trả kèm `component_scores`. Điều này giúp giải thích vì sao một sản phẩm đứng cao trong ranking, rất hữu ích cho mục đích học thuật và kiểm thử:

- nếu sản phẩm được đẩy lên vì graph,
- hay vì sequence model,
- hay vì tương đồng nội dung theo RAG.

Đây là một điểm mạnh khi so với các hệ recommendation hoàn toàn “black box”.

## 3.7 Chatbot tư vấn sản phẩm

### 3.7.1 Tích hợp Gemini/Groq
Chatbot của TechStore hỗ trợ gọi ra LLM bên ngoài, ưu tiên Gemini hoặc Groq tùy cấu hình môi trường. Việc thiết kế lớp client riêng trong `gemini_client.py` giúp hệ thống dễ thay đổi nhà cung cấp mô hình mà không phải viết lại toàn bộ luồng chatbot.

### 3.7.2 Fallback response
Một hệ thống học thuật hoặc demo rất dễ gặp vấn đề môi trường: API key không hợp lệ, model không tồn tại, quota hết hoặc mạng lỗi. Để tránh việc chatbot hoàn toàn “im lặng” trong các trường hợp này, TechStore có lớp `fallback.py`. Nhờ đó, hệ thống vẫn có thể trả một phản hồi hợp lệ dựa trên retrieval và template cơ bản.

### 3.7.3 Cấu trúc response API
Response của chatbot không chỉ chứa câu trả lời văn bản, mà còn có thể đính kèm:

- danh sách sản phẩm liên quan,
- payload recommendation,
- thông tin truy xuất sản phẩm theo ngữ cảnh.

Cách tổ chức này phù hợp với frontend thương mại điện tử vì câu trả lời không chỉ để đọc, mà còn để gắn trực tiếp vào hành động mua hàng như “xem chi tiết” hoặc “thêm vào giỏ”.

## 3.8 Kết quả thực nghiệm và notebook huấn luyện

### 3.8.1 Notebook training
Trong quá trình hoàn thiện đồ án, nhóm đã xây dựng notebook huấn luyện trong `ai-service/train_recommender_notebook.ipynb`. Notebook này cho phép:

- tạo dữ liệu synthetic,
- train lại sequence models,
- hiển thị bảng metric,
- kiểm tra recommendation đầu ra.

Đây là công cụ quan trọng để trình bày quá trình huấn luyện một cách trực quan thay vì chỉ mô tả bằng lời.

### 3.8.2 Kết quả với dữ liệu gốc
Khi chạy với dữ liệu hành vi gốc, mô hình sequence có các chỉ số tương đối thấp. Điều này là hợp lý vì dữ liệu gốc mang tính ngẫu nhiên cao, chưa phản ánh đầy đủ pattern mua sắm thực tế. Việc nêu rõ hạn chế này là cần thiết để giữ tính trung thực khoa học của báo cáo.

### 3.8.3 Kết quả với dữ liệu synthetic
Khi chuyển sang dữ liệu synthetic có pattern rõ hơn, metric của mô hình tăng mạnh, đặc biệt ở `top1_accuracy` và `top5_accuracy`. Kết quả này không có nghĩa là mô hình đã sẵn sàng cho production, mà cho thấy:

- pipeline huấn luyện và suy luận đang hoạt động đúng,
- mô hình có khả năng học được pattern nếu dữ liệu đủ cấu trúc,
- môi trường notebook phù hợp để minh họa kiến trúc AI của hệ thống.

## 3.9 Kết luận chương 3
Chương 3 là phần tạo nên giá trị đặc sắc của TechStore. Thay vì chỉ xây dựng một hệ thống thương mại điện tử CRUD, đồ án đã tách AI thành một service độc lập và hiện thực hóa một pipeline hoàn chỉnh gồm sequence modeling, graph signal, RAG và chatbot. Dù dữ liệu thực còn hạn chế và nhiều phần vẫn ở mức demo, cấu trúc hiện tại đủ mạnh để minh họa cách AI có thể trở thành một bounded context riêng trong kiến trúc microservices.

---

# CHƯƠNG 4: XÂY DỰNG HỆ THỐNG HOÀN CHỈNH

## 4.1 Kiến trúc triển khai
Hệ thống TechStore được tổ chức dưới dạng nhiều container phối hợp với nhau. Frontend chạy riêng, gateway chạy riêng, các service Django và FastAPI cũng có container độc lập, và mỗi service nghiệp vụ có database PostgreSQL riêng. Mô hình này giúp nhóm dễ tái lập môi trường và hạn chế sai khác giữa máy phát triển khác nhau.

## 4.2 API Gateway với Nginx
Nginx đóng vai trò như một API Gateway nhẹ. Trong đồ án, lựa chọn Nginx là hợp lý vì:

- cấu hình đơn giản,
- phù hợp với môi trường Docker,
- đủ để giải quyết bài toán reverse proxy,
- dễ mở rộng cho các path của nhiều service.

Gateway cũng giúp frontend chỉ cần biết một điểm vào duy nhất thay vì phải cấu hình nhiều base URL.

## 4.3 Xác thực JWT
JWT là lựa chọn phù hợp cho hệ thống hiện tại vì:

- không cần lưu session server-side theo cách truyền thống,
- phù hợp khi nhiều service cùng cần xác nhận người dùng,
- dễ tích hợp với frontend SPA.

Tuy nhiên, trong hệ thống phân tán, JWT cũng đặt ra yêu cầu quản lý secret thống nhất, thời gian sống token hợp lý, và cơ chế refresh token an toàn.

## 4.4 Frontend React/Vite
Frontend sử dụng React, TypeScript và Vite nhằm đạt được trải nghiệm phát triển nhanh và giao diện hiện đại. Các trang chính như đăng nhập, trang chủ, danh sách sản phẩm, chi tiết sản phẩm, giỏ hàng, checkout và chatbot tạo thành lớp tương tác chính với người dùng.

Việc có frontend riêng cho thấy hệ thống đã vượt ra khỏi mức “chỉ có backend API” và trở thành một sản phẩm có thể demo theo hướng end-user.

## 4.5 Docker hóa toàn bộ hệ thống
Docker là thành phần quan trọng giúp đồ án có tính thực hành cao. Nếu không có container hóa, việc cài đồng thời Django, FastAPI, PostgreSQL, frontend và gateway có thể gây nhiều khác biệt môi trường. Docker Compose cho phép:

- khai báo toàn bộ stack trong một file,
- khởi động đồng thời nhiều service,
- định nghĩa network nội bộ,
- tái lập môi trường nhanh chóng.

Ở góc độ học thuật, việc áp dụng Docker cũng cho thấy nhóm hiểu rõ rằng kiến trúc microservices không chỉ là sơ đồ phân rã mà còn gắn trực tiếp với cách triển khai.

## 4.6 Kiểm thử và đánh giá
Quá trình kiểm thử hệ thống có thể chia thành nhiều mức:

1. Kiểm thử mức service: xác nhận endpoint của từng service hoạt động.
2. Kiểm thử tích hợp: kiểm tra các luồng như checkout hoặc recommendation.
3. Kiểm thử frontend: xác nhận giao diện tương tác đúng với backend.
4. Kiểm thử notebook AI: đánh giá pipeline huấn luyện và metric.

Ở giai đoạn hiện tại, hệ thống đạt mức demo tốt nhưng vẫn còn khoảng cách để tiến tới production-grade. Những thiếu hụt như observability tập trung, distributed tracing, circuit breaker và cơ chế bất đồng bộ vẫn là các bước phát triển tiếp theo.

## 4.7 Kết luận chương 4
Chương 4 khẳng định rằng TechStore không chỉ dừng lại ở bản thiết kế lý thuyết. Toàn bộ các service, gateway, frontend, AI, database và Docker đã được gắn kết thành một hệ thống có thể chạy, kiểm thử và trình diễn. Đây là điểm tạo nên sức nặng thực hành cho toàn bộ bài tiểu luận.

---

# CHƯƠNG 5: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 5.1 Tổng kết
TechStore là một đồ án minh họa đầy đủ cho việc áp dụng kiến trúc microservices vào bài toán thương mại điện tử có tích hợp AI. Hệ thống thể hiện được cả hai mặt:

- nền tảng lý thuyết: microservices, DDD, database-per-service, gateway, JWT,
- triển khai thực tế: Django services, FastAPI AI service, frontend React/Vite, Docker Compose, notebook huấn luyện.

Đây là một hướng tiếp cận phù hợp với xu thế hiện đại của phát triển phần mềm, nơi việc phân tách nghiệp vụ và tổ chức hệ thống theo service ngày càng phổ biến.

## 5.2 Đóng góp chính của đồ án
Những đóng góp chính có thể tóm tắt như sau:

1. Xây dựng được một mô hình E-Commerce microservices đủ đầy cho mục tiêu học thuật.
2. Tổ chức các bounded context hợp lý theo DDD.
3. Thiết kế và triển khai AI Service như một domain độc lập.
4. Tạo được pipeline recommendation và chatbot có thể chạy được.
5. Docker hóa toàn bộ stack để dễ tái lập và trình diễn.

## 5.3 Hạn chế hiện tại
Dù có nhiều điểm mạnh, hệ thống hiện vẫn còn một số hạn chế quan trọng:

- Chưa có message queue cho các tác vụ bất đồng bộ.
- Chưa có distributed tracing và centralized logging.
- Payment service mới là mock.
- Dữ liệu recommendation thật còn yếu; notebook đang dùng synthetic data để minh họa kết quả đẹp hơn.
- Chưa có quy trình CI/CD hoàn chỉnh.

Việc nêu rõ những hạn chế này giúp bài tiểu luận giữ được tính trung thực và thể hiện đúng ranh giới hiện tại của đồ án.

## 5.4 Hướng phát triển ngắn hạn và dài hạn

### Hướng phát triển ngắn hạn
- Thêm Redis cache cho product catalog và recommendation.
- Hoàn thiện error handling giữa các service.
- Bổ sung thêm test tự động cho các luồng trọng yếu.
- Cải thiện dữ liệu hành vi để recommendation phản ánh thực tế hơn.

### Hướng phát triển dài hạn
- Tích hợp payment gateway thật.
- Bổ sung message broker như RabbitMQ hoặc Kafka.
- Triển khai observability stack.
- Mở rộng AI bằng dữ liệu thật và mô hình mạnh hơn.
- Tiến tới Kubernetes và auto scaling.

## 5.5 Bài học kinh nghiệm
Quá trình xây dựng TechStore cho thấy một số bài học quan trọng:

- Phân rã đúng domain quan trọng hơn việc cố gắng chia hệ thống thành thật nhiều service.
- Một hệ thống microservices tốt cần cả kiến trúc lẫn kỷ luật vận hành.
- AI không nên được thêm vào như một tiện ích phụ; khi đủ phức tạp, nó nên trở thành một domain riêng.
- Docker và gateway là những mảnh ghép quan trọng để biến kiến trúc thành hệ thống chạy được.

---

# TÀI LIỆU THAM KHẢO

1. Newman, Sam. *Building Microservices*.
2. Evans, Eric. *Domain-Driven Design: Tackling Complexity in the Heart of Software*.
3. Tài liệu chính thức của Django REST Framework.
4. Tài liệu chính thức của FastAPI.
5. Tài liệu PyTorch.
6. Tài liệu scikit-learn và FAISS.
7. Tài liệu về Nginx reverse proxy và Docker Compose.

---

# PHỤ LỤC A: TÓM TẮT FILE VÀ THÀNH PHẦN QUAN TRỌNG TRONG CODEBASE

| Thành phần | File/thư mục chính | Vai trò |
|---|---|---|
| API Gateway | `gateway/nginx.conf` | Điều phối request đến backend |
| Frontend | `frontend/src/` | Giao diện người dùng |
| User Service | `user-service/users/` | Người dùng và xác thực |
| Product Service | `product-service/catalog/` | Quản lý catalog |
| Cart Service | `cart-service/carts/` | Giỏ hàng |
| Order Service | `order-service/orders/` | Đơn hàng |
| Payment Service | `payment-service/payments/` | Thanh toán mock |
| AI Service | `ai-service/app/` | Recommendation, RAG, chatbot |
| Notebook | `ai-service/train_recommender_notebook.ipynb` | Minh họa huấn luyện và đánh giá mô hình |

# PHỤ LỤC B: ĐỀ XUẤT HÌNH ẢNH, SƠ ĐỒ VÀ BẢNG KHI CHUYỂN SANG WORD/PDF

Để tài liệu đạt độ dài và chất lượng trình bày khoảng 30-40 trang khi xuất sang Word hoặc PDF, nên bổ sung thêm các thành phần minh họa sau:

1. Sơ đồ kiến trúc tổng thể của hệ thống bằng Mermaid hoặc hình vẽ.
2. Sequence diagram cho luồng checkout.
3. Sequence diagram cho luồng chatbot.
4. Bảng mapping microservice với database và endpoint chính.
5. Ảnh chụp màn hình frontend: trang đăng nhập, trang danh sách sản phẩm, giỏ hàng, chatbot.
6. Ảnh chụp notebook huấn luyện mô hình.
7. Bảng so sánh chỉ số sequence model trên dữ liệu gốc và synthetic.
8. Ảnh chụp `docker compose up` hoặc trạng thái các container.

Khi bổ sung những thành phần này, tài liệu không chỉ đạt độ dài mong muốn mà còn tăng đáng kể tính thuyết phục về mặt học thuật và thực hành.
