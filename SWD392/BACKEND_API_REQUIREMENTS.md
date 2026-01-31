# Backend API Requirements - Exam Creation Feature

Tài liệu này liệt kê các API endpoints cần triển khai ở Backend để hỗ trợ đầy đủ chức năng tạo đề thi.

---

## 1. Exam API Extensions

### 1.1 Manage Questions in Exam

#### Add Questions to Exam

```http
POST /api/exam/{examId}/questions
```

**Request Body:**

```json
{
  "questionIds": [1, 2, 3, 4, 5]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Questions added successfully",
  "data": {
    "examId": 1,
    "totalQuestions": 5
  }
}
```

---

#### Get Questions of Exam

```http
GET /api/exam/{examId}/questions
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Question title",
        "content": "Question content...",
        "questionType": "MULTIPLE_CHOICE",
        "difficulty": "EASY",
        "points": 1,
        "answers": [
          { "id": 1, "content": "Answer A", "isCorrect": false },
          { "id": 2, "content": "Answer B", "isCorrect": true },
          { "id": 3, "content": "Answer C", "isCorrect": false },
          { "id": 4, "content": "Answer D", "isCorrect": false }
        ]
      }
    ],
    "totalItems": 10,
    "page": 0,
    "size": 100
  }
}
```

---

#### Remove Question from Exam

```http
DELETE /api/exam/{examId}/questions/{questionId}
```

**Response:**

```json
{
  "success": true,
  "message": "Question removed successfully"
}
```

---

### 1.2 Publish / Draft Status

#### Publish Exam

```http
POST /api/exam/{examId}/publish
```

**Response:**

```json
{
  "success": true,
  "message": "Exam published successfully",
  "data": {
    "id": 1,
    "status": "ACTIVE"
  }
}
```

---

#### Save as Draft

```http
POST /api/exam/{examId}/draft
```

**Response:**

```json
{
  "success": true,
  "message": "Exam saved as draft",
  "data": {
    "id": 1,
    "status": "DRAFT"
  }
}
```

---

### 1.3 Create Exam from Matrix

```http
POST /api/exam/from-matrix
```

**Request Body:**

```json
{
  "title": "Midterm Chemistry Exam",
  "description": "Chapter 1-5 assessment",
  "gradeLevel": 10,
  "durationMinutes": 60,
  "maxAttempts": 1,
  "passThreshold": 50,
  "startDate": "2026-02-01T08:00:00",
  "endDate": "2026-02-01T10:00:00",
  "showResultsImmediately": true,
  "showCorrectAnswers": false,
  "randomizeQuestions": true,
  "randomizeAnswers": true,
  "matrixId": 1
}
```

**Logic:**

- Lấy matrix config từ `matrixId`
- Random chọn câu hỏi từ Question Bank theo:
  - `easyCount` câu với `difficulty = EASY`
  - `mediumCount` câu với `difficulty = MEDIUM`
  - `hardCount` câu với `difficulty = HARD`
- Tạo exam với các câu hỏi đã chọn

**Response:**

```json
{
  "success": true,
  "message": "Exam created from matrix",
  "data": {
    "id": 1,
    "title": "Midterm Chemistry Exam",
    "totalQuestions": 20,
    "status": "DRAFT"
  }
}
```

---

### 1.4 Update Exam DTO

Cập nhật `ExamCreateDto` / `ExamUpdateDto` để hỗ trợ thêm các trường:

```java
public class ExamCreateDto {
    private String title;
    private String description;
    private Integer gradeLevel;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private Integer passThreshold;

    // NEW FIELDS
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean showResultsImmediately;
    private Boolean showCorrectAnswers;
    private Boolean randomizeQuestions;
    private Boolean randomizeAnswers;

    // For direct question assignment
    private List<Long> questionIds;
}
```

---

## 2. Exam Matrix API (NEW)

### Entity: ExamMatrix

```java
@Entity
@Table(name = "exam_matrices")
public class ExamMatrix {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @ManyToOne
    @JoinColumn(name = "question_bank_id")
    private QuestionBank questionBank;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    private Integer easyCount;
    private Integer easyPoints;
    private Integer mediumCount;
    private Integer mediumPoints;
    private Integer hardCount;
    private Integer hardPoints;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 2.1 Get All Matrices (Admin)

```http
GET /api/exam-matrix
```

---

### 2.2 Get My Matrices (Teacher)

```http
GET /api/exam-matrix/my
```

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Chemistry Final Matrix",
        "description": "Standard distribution for final exam",
        "questionBankId": 1,
        "questionBankName": "Chemistry Grade 10",
        "easyCount": 5,
        "easyPoints": 1,
        "mediumCount": 10,
        "mediumPoints": 2,
        "hardCount": 5,
        "hardPoints": 3,
        "createdAt": "2026-01-15T10:00:00"
      }
    ]
  }
}
```

---

### 2.3 Get Matrix by ID

```http
GET /api/exam-matrix/{id}
```

---

### 2.4 Create Matrix

```http
POST /api/exam-matrix
```

**Request Body:**

```json
{
  "name": "Chemistry Final Matrix",
  "description": "Standard distribution for final exam",
  "questionBankId": 1,
  "easyCount": 5,
  "easyPoints": 1,
  "mediumCount": 10,
  "mediumPoints": 2,
  "hardCount": 5,
  "hardPoints": 3
}
```

---

### 2.5 Update Matrix

```http
PUT /api/exam-matrix/{id}
```

---

### 2.6 Delete Matrix

```http
DELETE /api/exam-matrix/{id}
```

---

### 2.7 Preview Matrix (Get matching questions)

```http
POST /api/exam-matrix/preview
```

**Request Body:**

```json
{
  "questionBankId": 1,
  "easyCount": 5,
  "mediumCount": 10,
  "hardCount": 5
}
```

**Logic:**

- Truy vấn Question Bank
- Random chọn câu hỏi theo số lượng và độ khó
- Trả về danh sách câu hỏi đã chọn để preview

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Question 1",
      "content": "...",
      "difficulty": "EASY",
      "points": 1,
      "questionType": "MULTIPLE_CHOICE"
    }
    // ... more questions
  ]
}
```

---

## 3. Question API Extensions

### 3.1 Get Questions by Difficulty

```http
GET /api/questions/bank/{bankId}/difficulty/{difficulty}
```

**Parameters:**

- `bankId`: ID của Question Bank
- `difficulty`: `EASY` | `MEDIUM` | `HARD`

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Easy question 1",
        "content": "...",
        "difficulty": "EASY",
        "points": 1,
        "questionType": "MULTIPLE_CHOICE",
        "answers": [...]
      }
    ],
    "totalItems": 15
  }
}
```

---

### 3.2 Update Question Entity

Đảm bảo entity `Question` có trường `difficulty`:

```java
@Entity
@Table(name = "questions")
public class Question {
    // ... existing fields

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty")
    private Difficulty difficulty;  // EASY, MEDIUM, HARD

    private Integer points;  // Default: 1
}

public enum Difficulty {
    EASY,
    MEDIUM,
    HARD
}
```

---

## 4. Database Schema Updates

### 4.1 exam_matrices table

```sql
CREATE TABLE exam_matrices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    question_bank_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    easy_count INT DEFAULT 0,
    easy_points INT DEFAULT 1,
    medium_count INT DEFAULT 0,
    medium_points INT DEFAULT 2,
    hard_count INT DEFAULT 0,
    hard_points INT DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (question_bank_id) REFERENCES question_banks(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

### 4.2 exam_questions junction table (if not exists)

```sql
CREATE TABLE exam_questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    order_index INT DEFAULT 0,

    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id),

    UNIQUE KEY unique_exam_question (exam_id, question_id)
);
```

### 4.3 Update exams table

```sql
ALTER TABLE exams ADD COLUMN start_date TIMESTAMP NULL;
ALTER TABLE exams ADD COLUMN end_date TIMESTAMP NULL;
ALTER TABLE exams ADD COLUMN show_results_immediately BOOLEAN DEFAULT TRUE;
ALTER TABLE exams ADD COLUMN show_correct_answers BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN randomize_questions BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN randomize_answers BOOLEAN DEFAULT FALSE;
```

### 4.4 Update questions table

```sql
ALTER TABLE questions ADD COLUMN difficulty VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE questions ADD COLUMN points INT DEFAULT 1;
```

---

## 5. Controller Implementations

### ExamMatrixController.java

```java
@RestController
@RequestMapping("/api/exam-matrix")
@RequiredArgsConstructor
public class ExamMatrixController {

    private final ExamMatrixService examMatrixService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAll() { ... }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> getMy() { ... }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) { ... }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> create(@RequestBody ExamMatrixDto dto) { ... }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @RequestBody ExamMatrixDto dto) { ... }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) { ... }

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<?>> preview(@RequestBody MatrixPreviewDto dto) { ... }
}
```

---

## Summary Checklist

| Feature                            | Endpoint                                      | Priority |
| ---------------------------------- | --------------------------------------------- | -------- |
| Add questions to exam              | `POST /api/exam/{id}/questions`               | HIGH     |
| Get exam questions                 | `GET /api/exam/{id}/questions`                | HIGH     |
| Remove question from exam          | `DELETE /api/exam/{id}/questions/{qid}`       | MEDIUM   |
| Publish exam                       | `POST /api/exam/{id}/publish`                 | HIGH     |
| Save as draft                      | `POST /api/exam/{id}/draft`                   | MEDIUM   |
| Create from matrix                 | `POST /api/exam/from-matrix`                  | MEDIUM   |
| Get my matrices                    | `GET /api/exam-matrix/my`                     | HIGH     |
| Create matrix                      | `POST /api/exam-matrix`                       | HIGH     |
| Update matrix                      | `PUT /api/exam-matrix/{id}`                   | MEDIUM   |
| Delete matrix                      | `DELETE /api/exam-matrix/{id}`                | MEDIUM   |
| Preview matrix                     | `POST /api/exam-matrix/preview`               | MEDIUM   |
| Get questions by difficulty        | `GET /api/questions/bank/{id}/difficulty/{d}` | HIGH     |
| Add `difficulty` field to Question | Entity update                                 | HIGH     |
| Add schedule fields to Exam        | Entity update                                 | MEDIUM   |
