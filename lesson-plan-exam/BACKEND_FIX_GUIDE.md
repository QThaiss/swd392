# Backend Fix Required - ExamMatrix API

## Lỗi hiện tại

```
{
  "statusCode": 500,
  "message": "Internal server error: The given id must not be null",
  "success": false
}
```

## Data Frontend đang gửi (đúng format)

```json
{
  "name": "dd",
  "description": "dđ",
  "questionBankId": 1,
  "matrixItems": [
    {
      "difficulty": "HARD",
      "questionCount": 1,
      "pointsPerQuestion": 10
    }
  ]
}
```

---

## Nguyên nhân có thể

### 1. DTO không parse đúng `questionBankId`

**Fix:** Kiểm tra DTO class

```java
@Data
public class ExamMatrixCreateDto {
    @NotBlank
    private String name;

    private String description;

    @NotNull(message = "Question bank ID is required")
    private Long questionBankId;  // Phải là Long, không phải Integer

    @NotEmpty(message = "Matrix items are required")
    private List<MatrixItemDto> matrixItems;
}

@Data
public class MatrixItemDto {
    @NotNull
    private String difficulty;  // "EASY", "MEDIUM", "HARD"

    @NotNull
    private Integer questionCount;

    @NotNull
    private Integer pointsPerQuestion;
}
```

---

### 2. Service không tìm được QuestionBank

**Fix:** Trong `ExamMatrixService.java`

```java
@Service
@RequiredArgsConstructor
public class ExamMatrixService {

    private final ExamMatrixRepository examMatrixRepository;
    private final QuestionBankRepository questionBankRepository;
    private final UserRepository userRepository;

    @Transactional
    public ExamMatrix create(ExamMatrixCreateDto dto, Long userId) {
        // BUG: Đây có thể là chỗ bị lỗi
        // Kiểm tra questionBankId trước khi findById
        if (dto.getQuestionBankId() == null) {
            throw new IllegalArgumentException("Question bank ID is required");
        }

        QuestionBank questionBank = questionBankRepository.findById(dto.getQuestionBankId())
            .orElseThrow(() -> new ResourceNotFoundException("Question bank not found"));

        User teacher = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ExamMatrix matrix = new ExamMatrix();
        matrix.setName(dto.getName());
        matrix.setDescription(dto.getDescription());
        matrix.setQuestionBank(questionBank);
        matrix.setTeacher(teacher);

        // Create matrix items
        List<ExamMatrixItem> items = dto.getMatrixItems().stream()
            .map(itemDto -> {
                ExamMatrixItem item = new ExamMatrixItem();
                item.setDifficulty(Difficulty.valueOf(itemDto.getDifficulty()));
                item.setQuestionCount(itemDto.getQuestionCount());
                item.setPointsPerQuestion(itemDto.getPointsPerQuestion());
                item.setExamMatrix(matrix);  // Set parent relationship
                return item;
            })
            .collect(Collectors.toList());

        matrix.setMatrixItems(items);

        return examMatrixRepository.save(matrix);
    }
}
```

---

### 3. Entity relationship không đúng

**Fix:** Trong `ExamMatrix.java`

```java
@Entity
@Table(name = "exam_matrices")
@Data
public class ExamMatrix {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_bank_id", nullable = false)
    private QuestionBank questionBank;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @OneToMany(mappedBy = "examMatrix", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamMatrixItem> matrixItems = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

**Trong `ExamMatrixItem.java`:**

```java
@Entity
@Table(name = "exam_matrix_items")
@Data
public class ExamMatrixItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_matrix_id", nullable = false)
    private ExamMatrix examMatrix;

    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;

    private Integer questionCount;
    private Integer pointsPerQuestion;
}
```

---

### 4. Controller không parse request body

**Fix:** Trong `ExamMatrixController.java`

```java
@RestController
@RequestMapping("/api/exam-matrix")
@RequiredArgsConstructor
public class ExamMatrixController {

    private final ExamMatrixService examMatrixService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ExamMatrixDto>> create(
            @Valid @RequestBody ExamMatrixCreateDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Debug log
        System.out.println("Received dto: " + dto);
        System.out.println("QuestionBankId: " + dto.getQuestionBankId());

        Long userId = getUserIdFromUserDetails(userDetails);
        ExamMatrix matrix = examMatrixService.create(dto, userId);

        return ResponseEntity.ok(ApiResponse.success(toDto(matrix)));
    }
}
```

---

## Debug Steps

1. **Thêm log vào Controller:**

```java
System.out.println("Received DTO: " + dto);
System.out.println("QuestionBankId: " + dto.getQuestionBankId());
System.out.println("MatrixItems: " + dto.getMatrixItems());
```

2. **Kiểm tra xem DTO có nhận được data không**

3. **Nếu `questionBankId = null` trong DTO** → Jackson không parse được → Kiểm tra field name trong DTO class

---

## Quick Fix - Nếu field name khác

Nếu backend dùng field name khác (ví dụ: `questionBank` hoặc `bankId`), cần update frontend:

```javascript
// Trong ExamMatrixList.jsx - handleSubmit
const apiData = {
  name: formData.name,
  description: formData.description || "",
  questionBank: { id: bankId }, // Hoặc format khác tùy backend
  // ...
};
```

---

## Kiểm tra nhanh

Chạy curl để test API:

```bash
curl -X POST http://localhost:8080/api/exam-matrix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Matrix",
    "description": "Test",
    "questionBankId": 1,
    "matrixItems": [
      {"difficulty": "EASY", "questionCount": 5, "pointsPerQuestion": 1}
    ]
  }'
```

Nếu vẫn lỗi → Kiểm tra backend code theo hướng dẫn trên.
