# LessonPlanExam - Spring Boot Backend

## Yêu cầu hệ thống

- **Java 17** hoặc cao hơn
- **Maven 3.8+** (hoặc sử dụng Maven Wrapper)
- **PostgreSQL** database

## Cấu hình Database

Chỉnh sửa file `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/lesson_plan_exam
    username: postgres
    password: your_password
```

## Chạy ứng dụng

### Sử dụng Maven

```bash
mvn spring-boot:run
```

### Sử dụng Maven Wrapper (Windows)

```bash
.\mvnw.cmd spring-boot:run
```

### Sử dụng Maven Wrapper (Linux/Mac)

```bash
./mvnw spring-boot:run
```

## Build project

```bash
mvn clean package -DskipTests
```

## API Endpoints

### Authentication

- `POST /api/account/login` - Đăng nhập
- `POST /api/account/register-student` - Đăng ký học sinh
- `POST /api/account/register-teacher` - Đăng ký giáo viên
- `POST /api/account/forgot-password-otp` - Quên mật khẩu
- `POST /api/account/change-password` - Đổi mật khẩu
- `GET /api/account/profile` - Lấy thông tin profile

### Lesson Plans

- `GET /api/lesson-plan` - Lấy danh sách giáo án
- `POST /api/lesson-plan` - Tạo giáo án mới
- `GET /api/lesson-plan/{id}` - Lấy chi tiết giáo án
- `PUT /api/lesson-plan/{id}` - Cập nhật giáo án
- `DELETE /api/lesson-plan/{id}` - Xóa giáo án

### Question Banks

- `GET /api/question-bank` - Lấy danh sách ngân hàng câu hỏi
- `POST /api/question-bank` - Tạo ngân hàng câu hỏi
- `GET /api/question-bank/{id}` - Lấy chi tiết
- `PUT /api/question-bank/{id}` - Cập nhật
- `DELETE /api/question-bank/{id}` - Xóa

### Exams

- `GET /api/exam` - Lấy danh sách bài thi
- `POST /api/exam` - Tạo bài thi mới
- `GET /api/exam/{id}` - Lấy chi tiết bài thi
- `PUT /api/exam/{id}` - Cập nhật bài thi
- `DELETE /api/exam/{id}` - Xóa bài thi
- `POST /api/exam/{id}/activate` - Kích hoạt bài thi
- `POST /api/exam/{id}/deactivate` - Vô hiệu hóa bài thi

### Swagger UI

Truy cập: http://localhost:5206/swagger-ui.html

## Cấu trúc thư mục

```
src/main/java/com/lessonplanexam/
├── config/          # Spring configuration
├── controller/      # REST controllers
├── dto/             # Data Transfer Objects
├── entity/          # JPA entities
├── enums/           # Enum types
├── exception/       # Exception handling
├── repository/      # JPA repositories
├── security/        # JWT security
└── service/         # Business logic
```

## Port

Server chạy trên cổng: **5206**
