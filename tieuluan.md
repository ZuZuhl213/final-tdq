# BÁO CÁO TIỂU LUẬN FINAL
## Thiết kế và triển khai hệ thống E-Commerce TechStore theo kiến trúc Microservices

- Học phần: Software Architecture and Design
- Sinh viên: Nguyễn Thành Trung
- Lớp: E22CNPM02
- Giảng viên hướng dẫn: Trần Đình Quế
- Năm: 2026

---

## LỜI MỞ ĐẦU

Trong bối cảnh thương mại điện tử phát triển mạnh mẽ, các nền tảng bán hàng ngày càng phải xử lý lượng giao dịch lớn, cung cấp trải nghiệm người dùng tốt, tích hợp các tính năng AI và có khả năng mở rộng linh hoạt. Những hệ thống truyền thống theo mô hình monolithic ban đầu dễ triển khai nhưng nhanh chóng bộc lộ hạn chế khi quy mô tăng trưởng: khó mở rộng theo từng module, khó bảo trì, dễ ảnh hưởng lẫn nhau giữa các chức năng và khó áp dụng công nghệ mới một cách độc lập.

Bài tiểu luận này trình bày việc thiết kế và xây dựng hệ thống TechStore — một nền tảng thương mại điện tử mẫu theo kiến trúc microservices, sử dụng Django REST Framework cho các service nghiệp vụ, React/Vite cho giao diện, PostgreSQL cho dữ liệu, Nginx làm gateway và FastAPI cho AI service. Ngoài việc nêu rõ kiến trúc tổng thể, báo cáo còn phân tích quá trình phân rã theo Domain-Driven Design, cách thiết kế database-per-service, cách giao tiếp giữa các service, và cách tích hợp AI hỗ trợ tư vấn sản phẩm bằng RAG, Gemini và recommendation engine.

Mục tiêu chính của báo cáo là không chỉ mô tả lý thuyết mà còn gắn với thực tế triển khai hiện tại của dự án TechStore. Thông qua đó, người đọc có thể thấy được giá trị của kiến trúc microservices trong việc tách biệt nghiệp vụ, tăng khả năng phát triển song song, cải thiện khả năng kiểm soát lỗi và giúp hệ thống sẵn sàng cho việc mở rộng trong tương lai.

---

## MỤC LỤC

1. Từ monolithic đến microservices và DDD
2. Phát triển hệ thống E-Commerce microservices
3. AI service cho tư vấn sản phẩm
4. Xây dựng hệ thống hoàn chỉnh với Docker, Nginx và Frontend
5. Kết luận
6. Tài liệu tham khảo

---

# CHƯƠNG 1
## TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD

## 1.1 Giới thiệu về kiến trúc monolithic

Kiến trúc monolithic là mô hình đầu tiên được sử dụng rộng rãi trong các hệ thống phần mềm. Trong mô hình này, toàn bộ các thành phần của ứng dụng như giao diện người dùng, gọi API, xử lý nghiệp vụ, truy cập cơ sở dữ liệu và bảo mật được đóng gói thành một đơn vị triển khai duy nhất. Một ứng dụng monolithic thường có cấu trúc đơn giản, dễ hiểu ở giai đoạn đầu và phù hợp với các dự án có số lượng tính năng hạn chế.

Tuy nhiên, khi hệ thống bắt đầu mở rộng, monolithic sẽ bộc lộ những hạn chế rõ rệt. Đầu tiên là khả năng mở rộng bị ràng buộc vì phải scale toàn bộ ứng dụng. Nếu một module như thanh toán hoặc giỏ hàng chịu tải cao, toàn bộ hệ thống phải được nhân bản. Thứ hai là coupling cao: sửa một chức năng có thể ảnh hưởng những phần khác. Thứ ba là quá trình deploy và rollback trở nên rủi ro vì lỗi ở một thành phần có thể làm sập toàn bộ hệ thống. Cuối cùng, nhiều team làm việc trên cùng một codebase dẫn đến khó quản lý dependency, khó kiểm thử và khó duy trì.

Trong bối cảnh hệ thống thương mại điện tử ngày càng cần thêm tính năng, việc duy trì một monolith lớn trở nên hiệu quả thấp. Điều này là lý do khiến kiến trúc microservices trở thành xu hướng được nhiều tổ chức lựa chọn.

## 1.2 Microservices architecture

Microservices là kiến trúc chia ứng dụng thành nhiều service nhỏ, riêng rẽ, mỗi service đảm nhận một phạm vi nghiệp vụ nhất định. Mỗi service có khả năng triển khai, nâng cấp, scale độc lập và có cơ chế giao tiếp với service khác qua API hoặc message broker.

Điểm nổi bật của kiến trúc microservices là cơ chế database-per-service. Mỗi service sở hữu một hoặc nhiều cơ sở dữ liệu riêng, tránh tình trạng các service phụ thuộc trực tiếp vào cùng một schema. Điều này giúp giảm coupling, tăng tính độc lập của từng domain và giúp team phát triển song song. Ngoài ra, mỗi service có thể được viết bằng công nghệ phù hợp nhất với nghiệp vụ: Django cho backend, FastAPI cho AI, React/Vite cho frontend và PostgreSQL cho dữ liệu.

So với monolithic, microservices mang lại nhiều ưu điểm: khả năng mở rộng theo từng service, fault isolation tốt hơn, maintainability cao hơn, dễ cập nhật công nghệ và cho phép nhiều team làm việc cùng lúc. Tuy nhiên, kiến trúc này cũng đi kèm nhiều thách thức như độ phức tạp cao, khó tracing, khó kiểm soát độ nhất quán dữ liệu phân tán, và cần các kỹ thuật vận hành tốt hơn như monitoring, logging, health check, retry, timeout và circuit breaker.

## 1.3 Domain-Driven Design (DDD)

DDD là phương pháp tiếp cận thiết kế phần mềm dựa trên nghiệp vụ, giúp mô hình hoá các ranh giới logic của hệ thống theo domain thay vì theo lớp công nghệ. Trong DDD, các khái niệm chính gồm entity, value object, aggregate, bounded context, repository và domain service. Một bounded context là vùng logic riêng biệt, nơi một tập hợp khái niệm có ý nghĩa nhất định và được hiểu thống nhất.

Trong dự án TechStore, việc áp dụng DDD giúp phân chia hệ thống thành các domain rõ ràng:

- User domain: quản lý tài khoản, hồ sơ, xác thực
- Product domain: quản lý sản phẩm và danh mục
- Cart domain: quản lý giỏ hàng
- Order domain: quản lý đơn hàng
- Payment domain: xử lý thanh toán giả lập
- AI domain: gợi ý và tư vấn sản phẩm

Việc phân tách theo bounded context giúp mỗi service giữ một phạm vi trách nhiệm rõ ràng, tránh việc nhầm lẫn giữa nghiệp vụ và kỹ thuật. Đây là nền tảng lý thuyết cho thiết kế microservices của dự án.

## 1.4 Ứng dụng DDD vào TechStore

Hệ thống TechStore được phân rã thành các microservice tương ứng với các bounded context chính. Bên cạnh việc tách domain logic, dự án còn áp dụng nguyên tắc API-first và service contract để giảm phụ thuộc giữa các service. Khi một service cần dữ liệu từ service khác, nó chỉ dùng API được công bố chứ không truy cập trực tiếp database của service khác.

Ví dụ:

- `order-service` gọi `cart-service` để lấy sản phẩm trong giỏ khi khách hàng đặt hàng.
- `order-service` gọi `payment-service` để tạo giao dịch thanh toán giả lập.
- `ai-service` sử dụng dữ liệu từ `product-service` để tạo index RAG và xử lý câu hỏi của người dùng.

Đây là cách mô hình hóa các dependency ở mức nghiệp vụ, giúp hệ thống có tính mở rộng và dễ kiểm soát hơn.

## 1.5 Kết luận chương 1

Chương 1 đã chỉ ra rằng, với quy mô và tính phức tạp của hệ thống thương mại điện tử hiện đại, kiến trúc monolithic không còn đủ để đáp ứng nhu cầu về tốc độ phát triển, mở rộng và bảo trì. Microservices và DDD là hai nền tảng quan trọng giúp chuyển hệ thống từ một khối lớn sang các domain độc lập, dễ quản lý hơn. Đây chính là tiền đề để xây dựng TechStore như một hệ thống hiện đại, có thể mở rộng theo từng nghiệp vụ.

---

# CHƯƠNG 2
## PHÁT TRIỂN HỆ THỐNG E-COMMERCE MICROSERVICES

## 2.1 Xác định yêu cầu hệ thống

Hệ thống TechStore được xây dựng với các yêu cầu chức năng và phi chức năng sau:

### Yêu cầu chức năng
- Người dùng có thể đăng ký, đăng nhập và cập nhật thông tin cá nhân.
- Người dùng có thể xem danh mục sản phẩm, tìm kiếm và xem chi tiết sản phẩm.
- Người dùng có thể thêm, xóa, chỉnh sửa sản phẩm trong giỏ hàng.
- Người dùng có thể tạo đơn hàng và theo dõi trạng thái.
- Hệ thống có cơ chế thanh toán giả lập.
- Hệ thống có AI chat và gợi ý sản phẩm bằng RAG và Gemini.

### Yêu cầu phi chức năng
- Có khả năng triển khai bằng Docker Compose.
- Mỗi service có thể chạy độc lập và scale riêng.
- Hệ thống có xác thực JWT.
- Dữ liệu được tách theo service để giảm coupling.
- Có khả năng theo dõi lỗi và debug theo từng domain.

## 2.2 Phân rã hệ thống theo DDD

Dựa trên phạm vi nghiệp vụ, hệ thống được phân thành 6 service chính:

| Service | Vai trò chính | Database |
|---|---|---|
| user-service | Xác thực, đăng ký, hồ sơ người dùng | user_db |
| product-service | Quản lý sản phẩm, danh mục, thương hiệu | product_db |
| cart-service | Quản lý giỏ hàng | cart_db |
| order-service | Quản lý đơn hàng | order_db |
| payment-service | Thanh toán giả lập | payment_db |
| ai-service | Gợi ý, chatbot, RAG | Không bắt bu DB riêng |

Việc phân chia này giúp mỗi service tập trung vào một nghiệp vụ riêng, giảm sự phụ thuộc và tăng tính phát triển nội tại của từng domain.

## 2.3 Thiết kế các service chính

### 2.3.1 User service
User service chịu trách nhiệm xác thực và lưu trữ thông tin người dùng. Nó sử dụng Django AbstractUser để tạo model user, hỗ trợ vai trò admin, staff, customer, và phân quyền qua JWT. Service này cung cấp API đăng nhập, đăng ký và truy vấn hồ sơ hiện tại.

Lợi ích của việc tách user service riêng là giảm rủi ro ảnh hưởng từ các chức năng khác khi user logic thay đổi. Đồng thời, xác thực có thể được sử dụng thống nhất cho toàn bộ gateway và các service khác.

### 2.3.2 Product service
Product service là nơi quản lý catalog sản phẩm. Tại đây có các model như Product, Category, Brand, và có thể mở rộng thành Book, Electronics, Fashion hoặc các loại sản phẩm khác. Service này cung cấp API đọc danh sách sản phẩm, tìm kiếm theo từ khóa, lọc theo danh mục và hỗ trợ dữ liệu cho AI service.

### 2.3.3 Cart service
Cart service quản lý các sản phẩm mà người dùng bỏ vào giỏ. Nó có thể lưu trữ mỗi cart theo user, theo session hoặc theo account. Khi user thực hiện checkout, order service sẽ truy vấn cart-service để lấy danh sách item đã chọn.

### 2.3.4 Order service
Order service xử lý logic tạo đơn hàng. Service này có thể tiếp nhận yêu cầu từ frontend, lấy item từ cart-service, gọi payment-service để xác nhận thanh toán và lưu đơn hàng vào database riêng. Đây là service trung tâm trong quy trình mua hàng.

### 2.3.5 Payment service
Payment service là một service mock, giả lập quá trình thanh toán. Nó không cần tích hợp cổng thanh toán thật, chỉ cần trả về trạng thái thành công hoặc thất bại, kèm mã giao dịch mẫu. Điều này phù hợp với môi trường demo và học tập.

## 2.4 Thiết kế database-per-service

Một nguyên tắc cốt lõi của kiến trúc microservices là mỗi service có cơ sở dữ liệu riêng. Trong TechStore, mỗi service một database riêng với tên như user_db, product_db, cart_db, order_db, payment_db.

Lợi ích của cách thiết kế này:

1. Giảm coupling giữa các service.
2. Mỗi service có thể tối ưu schema và query riêng.
3. Khi một service phát triển, không ảnh hưởng trực tiếp đến service khác.
4. Mỗi service có thể scale độc lập nếu cần.

Tuy nhiên, điều này cũng tạo ra vấn đề nhất quán dữ liệu phân tán. Khi một order được tạo, dữ liệu về sản phẩm, giỏ hàng và thanh toán nằm ở nhiều database khác nhau. Vì vậy, hệ thống cần thiết kế giao diện API và quy trình nghiệp vụ rõ ràng để tránh tình trạng dữ liệu không nhất quán.

## 2.5 API Gateway và luồng gọi giữa các service

Gateway được triển khai bằng Nginx, đóng vai trò entry point cho hệ thống. Tất cả request từ frontend đều đi qua gateway tại port 18080. Gateway chuyển tiếp request đến service phù hợp dựa trên đường dẫn như /api/auth/, /api/products/, /api/cart/, /api/orders/ và /api/ai/.

Lợi ích của gateway:

- Tập trung routing và điều phối request.
- Ẩn cấu trúc bên trong khỏi frontend.
- Dễ dàng áp dụng bảo mật, logging, rate limiting.
- Giảm sự phụ thuộc trực tiếp của frontend vào từng service riêng lẻ.

## 2.6 Luồng end-to-end của hệ thống

Một quy trình đặt hàng điển hình như sau:

1. Người dùng đăng nhập bằng JWT.
2. Frontend gửi request đến gateway.
3. Product service trả danh sách sản phẩm và thông tin chi tiết.
4. User thêm sản phẩm vào giỏ bằng cart service.
5. Order service nhận đơn hàng, kiểm tra giỏ hàng và gọi payment service.
6. Order được lưu vào database order_db.
7. Nếu người dùng cần tư vấn AI, frontend gửi câu hỏi đến ai-service.
8. AI service dùng dữ liệu từ sản phẩm để trả lời, gợi ý sản phẩm phù hợp.

Quy trình này cho thấy cách các service phối hợp cùng nhau nhưng vẫn giữ nguyên tính độc lập.

## 2.7 Đánh giá kiến trúc hiện tại

Một số điểm mạnh của thiết kế TechStore:

- Phân rã rõ ràng theo bounded context.
- Mỗi service có đường đi và trách nhiệm riêng.
- Có thể chạy bằng Docker Compose để dễ demo và kiểm thử.
- Hỗ trợ tích hợp AI và recommendation system.

Một số thách thức còn tồn tại:

- Giao tiếp giữa các service phải xử lý lỗi, timeout, retry.
- Dữ liệu phân tán đòi hỏi kỹ năng monitoring và tracing.
- Có thể cần thêm message queue để giảm coupling trong tương lai.

## 2.8 Kết luận chương 2

Chương 2 đã trình bày thiết kế hệ thống E-Commerce microservices cho TechStore, từ phân rã theo DDD, thiết kế từng service, tới luồng hoạt động tổng thể. Đây là phần cốt lõi của bài tiểu luận, thể hiện cách một hệ thống thương mại điện tử có thể được chuyển từ mô hình monolith sang mô hình microservices để đáp ứng yêu cầu quản lý, mở rộng và phát triển lâu dài.

---

# CHƯƠNG 3
## AI SERVICE CHO TƯ VẤN SẢN PHẨM

## 3.1 Mục tiêu của AI service

AI service của TechStore được triển khai như một microservice độc lập bằng FastAPI trong thư mục `ai-service`. Service này xử lý hai chức năng bắt buộc của Chương 3:

- gợi ý sản phẩm kế tiếp dựa trên chuỗi hành vi người dùng
- chatbot tư vấn sản phẩm dựa trên truy vấn ngôn ngữ tự nhiên

Đầu vào chính của service gồm:

- dữ liệu hành vi `user_id`, `product_id`, `action`, `timestamp`
- câu hỏi của người dùng gửi tới chatbot

Đầu ra gồm:

- danh sách sản phẩm được xếp hạng theo hybrid score
- câu trả lời chatbot và danh sách sản phẩm liên quan

## 3.2 Kiến trúc AI service

Kiến trúc thực tế của AI service hiện tại gồm các thành phần sau:

1. `app/main.py`: khởi tạo FastAPI, expose API `/recommend` và `/chatbot`, đồng thời giữ alias `/api/ai/recommend` và `/api/ai/chat/` để tương thích gateway.
2. `app/recommendation.py`: huấn luyện và suy luận ba mô hình sequence `RNN`, `LSTM`, `biLSTM`, sau đó kết hợp với graph score và RAG score theo công thức hybrid.
3. `app/rag_retrieve.py`: tạo embedding sản phẩm bằng TF-IDF, lưu vector vào FAISS, truy xuất sản phẩm liên quan theo truy vấn.
4. `app/gemini_client.py`: tích hợp LLM với hai lựa chọn runtime là Gemini hoặc Groq; nếu gọi LLM lỗi thì trả về fallback response.
5. `app/fallback.py`: đảm bảo chatbot vẫn trả được câu trả lời hợp lệ ngay cả khi LLM ngoài không khả dụng.

Kiến trúc này đáp ứng được yêu cầu cốt lõi của đề tài: có sequence model, có graph signal, có RAG và có API chạy được.

## 3.3 Thu thập và chuẩn hóa dữ liệu hành vi người dùng

Dữ liệu hành vi đang được đọc từ file `ai-service/data/user_behavior.csv` với các cột:

- user_id
- product_id
- action (view, click, add_to_cart)
- timestamp

Trong phiên bản code hiện tại, dữ liệu được chuẩn hóa theo các bước sau:

- đọc CSV bằng `pandas`
- chuẩn hóa action về 3 nhãn `view`, `click`, `add_to_cart`
- các bản ghi `purchase` cũ trong dữ liệu đã được đổi sang `add_to_cart` để khớp với yêu cầu đầu bài
- sắp xếp theo `user_id` và `timestamp`
- tách chuỗi hành vi riêng cho từng user
- dùng `window_size = 5` hành vi gần nhất làm đầu vào và sản phẩm tiếp theo làm nhãn dự đoán

Như vậy, bài toán được mô hình hóa đúng dạng time-series sequence prediction cho recommendation.

## 3.4 Sequence Modeling với RNN, LSTM và biLSTM

Ba mô hình sequence hiện được triển khai thật bằng PyTorch trong `app/recommendation.py`. Mỗi mẫu dữ liệu gồm:

- input: 5 hành vi gần nhất của user, mỗi hành vi gồm `product_id` và `action`
- output: phân phối xác suất trên toàn bộ catalog sản phẩm
- mục tiêu: dự đoán sản phẩm mà user có khả năng tương tác tiếp theo

### 3.4.1 Ý tưởng chung

- Input: một window gồm 5 hành vi gần nhất của user, mỗi hành vi gồm product_id và action.
- Output: xác suất phân phối trên toàn bộ product catalog.
- Mục tiêu: dự đoán sản phẩm tiếp theo mà user có khả năng click, view hoặc add_to_cart.

### 3.4.2 RNN (Recurrent Neural Network)

Mô hình RNN được cài bằng `torch.nn.RNN`. Input của mô hình là phép ghép giữa product embedding và action embedding. Hidden state cuối được đưa qua fully connected layer để sinh logits trên toàn bộ product catalog.

### 3.4.3 LSTM (Long Short-Term Memory)

Mô hình LSTM được cài bằng `torch.nn.LSTM`. Cấu trúc embedding và output giống RNN, nhưng phần xử lý chuỗi dùng cell state để giữ ngữ cảnh tốt hơn.

### 3.4.4 biLSTM (Bidirectional LSTM)

Mô hình biLSTM được cài bằng `torch.nn.LSTM(..., bidirectional=True)`. Output cuối cùng là vector 2 chiều hướng được đưa vào lớp tuyến tính để dự đoán phân phối sản phẩm.

## 3.5 Mô hình huấn luyện và dự đoán sản phẩm tiếp theo

Pipeline huấn luyện hiện tại được kiểm chứng như sau:

1. Mã hóa `product_id` và `action` thành index số.
2. Tạo sequence dataset từ dữ liệu hành vi theo từng user.
3. Dùng product embedding và action embedding.
4. Dùng lớp sequence tương ứng: `nn.RNN`, `nn.LSTM`, `nn.LSTM bidirectional`.
5. Dùng `CrossEntropyLoss` và `Adam` để train.
6. Lưu model cache vào `ai-service/data/artifacts/*.pt` để tránh train lại mỗi lần startup.

Trong lần kiểm chứng local trên dataset hiện tại, service trả về các metric validation sau:

- RNN: top-1 accuracy = 0.0173, top-5 accuracy = 0.0969
- LSTM: top-1 accuracy = 0.0133, top-5 accuracy = 0.0847
- biLSTM: top-1 accuracy = 0.0184, top-5 accuracy = 0.0969

Các con số này cho thấy mô hình đã được train và suy luận thật, tuy nhiên chất lượng hiện tại còn thấp do dữ liệu đang là dữ liệu seed ngẫu nhiên chứ chưa phải log hành vi thực tế.

## 3.6 Knowledge Graph với Neo4j

Graph layer hiện được cài trong `GraphSignal` của `app/recommendation.py`.

Phần đã hoàn thành:

- xây dựng transition graph giữa các sản phẩm từ chuỗi hành vi người dùng
- cộng thêm similarity signal theo `category` và `brand`
- hỗ trợ đồng bộ node và cạnh sang Neo4j nếu có cấu hình `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`
- nếu không có Neo4j thì tự động chạy fallback bằng graph in-memory

Kết quả kiểm chứng local hiện tại:

- service chạy ổn định với `graph_backend = in_memory`
- phần đồng bộ và truy vấn Neo4j đã có trong code nhưng chưa được kiểm chứng runtime vì môi trường hiện tại chưa cấu hình Neo4j server

Do đó, trong trạng thái hiện tại có thể kết luận rằng graph recommendation đã hoạt động, còn phần Neo4j là đang hỗ trợ ở mức tích hợp code và cần thêm môi trường để kiểm chứng end-to-end.

## 3.7 RAG (Retrieval-Augmented Generation)

RAG hiện được triển khai bằng FAISS trong `app/rag_retrieve.py`.

Quy trình thực tế:

1. Tạo văn bản mô tả cho từng sản phẩm từ `name`, `description`, `brand`, `category`.
2. Mã hóa văn bản thành vector TF-IDF.
3. Chuẩn hóa vector và đưa vào FAISS `IndexFlatIP`.
4. Với mỗi truy vấn, lấy top-k sản phẩm liên quan.
5. Chuyển các sản phẩm này sang chatbot để tạo câu trả lời.

Như vậy service đã có RAG retrieval thực tế, không còn chỉ là keyword match hoặc mô tả lý thuyết.

## 3.8 Hybrid recommendation

Recommendation cuối cùng được tính bằng cách kết hợp đủ 5 nguồn tín hiệu theo đúng yêu cầu đề tài:

- final_score = w1 * rnn + w2 * lstm + w3 * bilstm + w4 * graph + w5 * rag

Trong code hiện tại, trọng số mặc định là:

- `rnn = 0.20`
- `lstm = 0.25`
- `bilstm = 0.25`
- `graph = 0.15`
- `rag = 0.15`

Trọng số này có thể thay đổi qua biến môi trường `HYBRID_WEIGHTS`. Kết quả trả về từ API cũng hiển thị `component_scores` của từng sản phẩm để dễ giải thích vì sao một sản phẩm được xếp hạng cao.

## 3.9 Hai dạng AI Service bắt buộc

### 3.9.1 Recommendation List

- API bắt buộc đã có: `GET /recommend?user_id=1`
- Ngoài ra còn có alias tương thích gateway: `GET /api/ai/recommend`
- Output là JSON gồm lịch sử 5 hành vi gần nhất, trọng số hybrid, metric model và danh sách sản phẩm xếp hạng

### 3.9.2 Chatbot tư vấn sản phẩm

- API bắt buộc đã có: `POST /chatbot`
- Ngoài ra còn có alias tương thích gateway: `POST /api/ai/chat/`
- Input: câu hỏi và `user_id`
- Output: câu trả lời chatbot, danh sách sản phẩm và payload recommendation đính kèm

## 3.10 Triển khai AI Service

AI service hiện sử dụng các thành phần sau trong code thực tế:

- FastAPI cho API service
- PyTorch cho sequence model
- FAISS cho vector retrieval
- TF-IDF embedding cho catalog sản phẩm
- Neo4j ở mức hỗ trợ tích hợp runtime nếu có server
- Gemini hoặc Groq cho chatbot LLM
- pandas / numpy để xử lý dữ liệu

Kết quả kiểm chứng thực tế:

- `pytest tests/test_api.py` chạy pass
- smoke test HTTP thật với `uvicorn` + `curl` cho `/recommend` và `/chatbot` chạy thành công
- `/recommend` trả về hybrid recommendation với `window_size = 5`
- `/chatbot` luôn trả kết quả hợp lệ; trong môi trường local hiện tại chatbot đang dùng fallback vì Gemini trả lỗi model-not-found với API key có sẵn

## 3.11 Checklist đánh giá

Đối chiếu với yêu cầu đề tài, trạng thái hiện tại như sau:

- Đã hoàn thành: pipeline AI rõ ràng bằng FastAPI
- Đã hoàn thành: 3 mô hình sequence RNN, LSTM, biLSTM
- Đã hoàn thành: hybrid recommendation theo công thức 5 thành phần
- Đã hoàn thành: RAG bằng FAISS + embedding sản phẩm
- Đã hoàn thành: API `/recommend` và `/chatbot`
- Đã hoàn thành: kiểm chứng local bằng pytest và HTTP smoke test
- Đang hỗ trợ: đồng bộ và truy vấn Neo4j runtime, cần cấu hình server Neo4j để kiểm chứng end-to-end
- Đang hỗ trợ: phản hồi LLM giàu ngôn ngữ từ Gemini/Groq, phụ thuộc key/model hợp lệ của môi trường chạy

## 3.12 Kết luận chương 3

AI service của TechStore hiện đã đạt phần cốt lõi của Chương 3 ở mức code chạy được: có service FastAPI độc lập, có ba mô hình sequence train thật trên dữ liệu hành vi, có hybrid recommendation, có RAG bằng FAISS và có chatbot API hoạt động. Tuy nhiên, chất lượng recommendation hiện còn hạn chế do dữ liệu đang là dữ liệu seed ngẫu nhiên, còn phần Neo4j và LLM ngoài phụ thuộc thêm vào môi trường triển khai cụ thể để khai thác đầy đủ. Vì vậy, báo cáo này chỉ khẳng định những phần đã hoàn thành và đã kiểm chứng, đồng thời ghi rõ các phần đang hỗ trợ để tránh mô tả vượt quá trạng thái thực tế của dự án.

---

# CHƯƠNG 4
## XÂY DỰNG HỆ THỐNG HOÀN CHỈNH (DOCKER, NGINX, REACT)

## 4.1 Kiến trúc tổng thể

TechStore được triển khai như một hệ thống gồm nhiều container:

- Frontend React/Vite
- API Gateway Nginx
- Các Django service: user, product, cart, order, payment
- AI service FastAPI
- Các database PostgreSQL riêng biệt

Kiến trúc này giúp thay đổi từng thành phần một cách độc lập. Khi cần nâng cấp frontend, chỉ cần rebuild frontend container. Khi muốn thêm service mới, chỉ cần thêm một module và khai báo trong docker-compose.

## 4.2 Nginx gateway

Gateway là điểm kết nối giữa frontend và các service backend. Nginx được cấu hình để routing theo đường dẫn. Mỗi request từ frontend được gửi đến gateway rồi chuyển tiếp đến service phù hợp.

Điều này giúp:

- Tập trung quản lý đường dẫn API
- Giảm phụ thuộc trực tiếp từ frontend vào môi trường container
- Giảm thao tác cấu hình ở client

## 4.3 Xác thực JWT

Các service Django sử dụng JWT để xác thực người dùng. Khi user đăng nhập, backend cấp token và frontend lưu token vào local storage hoặc memory. Mỗi request có token sẽ được gửi kèm theo khi gọi API. Token giúp server xác định người dùng hiện tại và kiểm soát quyền truy cập.

Quy trình xác thực gồm:

1. Người dùng gửi username + password.
2. User service kiểm tra tài khoản.
3. Nếu hợp lệ, server tạo access token và refresh token.
4. Frontend gửi token trong header Authorization.
5. Service kiểm tra token và cho phép gọi API nếu hợp lệ.

## 4.4 Docker và docker-compose

Docker giúp đóng gói từng service cùng với dependency của nó. Hệ thống có thể chạy trên bất kỳ máy nào có Docker. Docker Compose dùng để định nghĩa toàn bộ stack gồm:

- các service nội bộ
- các database
- gateway
- frontend
- volume và network

Việc dùng Docker giúp môi trường dev, test và demo trở nên nhất quán. Khác biệt giữa máy lập trình và máy triển khai được giảm đáng kể.

## 4.5 Frontend React/Vite

Frontend được xây dựng bằng React + Vite + TypeScript và Tailwind CSS. Frontend chia thành các phần như:

- trang đăng nhập và đăng ký
- trang danh sách sản phẩm
- trang chi tiết sản phẩm
- giỏ hàng
- đơn hàng
- AI chatbot

Người dùng có thể thao tác trực tiếp với hệ thống mà không cần biết backend được chia thành nhiều service như thế nào. Đây là lợi thế của kiến trúc gateway-based.

## 4.6 Logging và bảo mật

Trong một hệ thống microservices, logging và security là hai yếu tố rất quan trọng. Mỗi service cần ghi lại log rõ ràng về request, response, lỗi và trạng thái. Ngoài ra, nên có:

- kiểm tra token trên mỗi request
- hạn chế quyền truy cập theo role
- bảo vệ các endpoint nhạy cảm
- dùng biến môi trường cho key và secret

Bảo mật trong kiến trúc microservices không chỉ là bảo vệ service riêng lẻ mà còn là bảo vệ toàn bộ đường đi từ frontend tới backend.

## 4.7 Thử nghiệm và kiểm chứng

Để đảm bảo hệ thống hoạt động, cần thực hiện các loại kiểm thử:

- Unit test cho service logic
- Integration test giữa API và DB
- API test cho các endpoint quan trọng
- Smoke test sau khi khởi động container
- E2E test với giao diện người dùng

Đối với một demo như TechStore, sự kiện đăng nhập, mở sản phẩm, thêm vào giỏ hàng và gọi AI chatbot là các luồng chính cần được kiểm tra kỹ lưỡng.

## 4.8 Phân tích giá trị thực tế của dự án

Dự án TechStore không chỉ là một bài tập học thuật mà còn mang giá trị thực tế rất lớn:

- Minh họa rõ cách chuyển từ monolith sang microservices.
- Cung cấp ví dụ về kiến trúc service-oriented cho thương mại điện tử.
- Giúp người học hiểu cách tích hợp AI, Docker, API Gateway và frontend.
- Là nền tảng để phát triển thành hệ thống sản phẩm thật trong tương lai.

## 4.9 Kết luận chương 4

Chương 4 đã tổng hợp các thành phần triển khai thực tế của TechStore, từ frontend, gateway, xác thực JWT, Docker, đến các vấn đề bảo mật và kiểm thử. Đây là phần cho thấy hệ thống không dừng lại ở lý thuyết mà đã được xây dựng thành một nền tảng có thể chạy và demo được.

---

# KẾT LUẬN

Bài tiểu luận đã trình bày quá trình thiết kế và triển khai hệ thống TechStore theo kiến trúc microservices, từ phân tích vấn đề của monolithic, áp dụng DDD để chia bounded context, xây dựng các microservice chuyên biệt, tích hợp AI và triển khai bằng Docker, Nginx và React.

Từ góc nhìn kiến trúc phần mềm, TechStore là một ví dụ rõ ràng về cách công nghệ hiện đại được áp dụng để giải quyết các bài toán thương mại điện tử có tính mở rộng cao. Hệ thống này không chỉ phù hợp cho mục đích học tập mà còn có thể mở rộng thành nền tảng sản phẩm thực tế ở quy mô lớn hơn.

Những bài học chính rút ra gồm:

1. Microservices giúp tách rời nghiệp vụ và nâng cao khả năng phát triển song song.
2. DDD là cơ chế hữu ích để xác định ranh giới service và quản lý domain logic.
3. AI service có thể trở thành một domain độc lập, hỗ trợ trải nghiệm người dùng tốt hơn.
4. Docker và gateway là công cụ quan trọng để triển khai hệ thống một cách nhất quán.
5. Bất kỳ kiến trúc phân tán nào cũng cần có chiến lược monitoring, security và fault tolerance rõ ràng.

Trong tương lai, dự án TechStore hoàn toàn có thể được nâng cấp bằng các công nghệ như Kubernetes, message queue, observability stack, CI/CD và tích hợp payment gateway thật. Điều này chứng minh rằng hệ thống này không chỉ là một báo cáo học thuật mà còn là nền tảng cho những hướng phát triển thực tiễn.

---

# TÀI LIỆU THAM KHẢO

1. Newman, S. Building Microservices.
2. Evans, E. Domain-Driven Design: Tackling Complexity in the Heart of Software.
3. Richardson, C. Microservices Patterns.
4. Django REST Framework Documentation.
5. FastAPI Documentation.
6. Nginx Official Documentation.
7. Docker Compose Documentation.
8. Google Gemini API Documentation.
9. FAISS and RAG documentation.
10. Báo cáo tiểu luận TechStore và tài liệu nội bộ của dự án.

---

## PHỤ LỤC A – Tóm tắt chức năng chính của dự án

- User authentication và role-based access
- Catalog sản phẩm
- Giỏ hàng và đơn hàng
- Thanh toán mock
- AI recommendation và chatbot
- Frontend React/Vite
- Deployment bằng Docker Compose

## PHỤ LỤC B – Gợi ý cải tiến trong tương lai

- Thêm monitoring và tracing
- Bổ sung CI/CD pipeline
- Thay payment mock bằng cổng thanh toán thực
- Tích hợp search engine chuyên dụng
- Mở rộng AI thành recommendation cá nhân hóa dựa trên lịch sử người dùng
