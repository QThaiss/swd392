package com.lessonplanexam.dto.exam;

import com.lessonplanexam.dto.exammatrix.CreateExamMatrixRequest;
import com.lessonplanexam.enums.EScoringMethod;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExamFromMatrixRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @Min(value = 1, message = "Grade level must be between 1 and 12")
    @Max(value = 12, message = "Grade level must be between 1 and 12")
    private Integer gradeLevel;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private Integer maxAttempts;

    private BigDecimal passThreshold;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    private Boolean showResultsImmediately;

    private Boolean showCorrectAnswers;

    private Boolean randomizeQuestions;

    private Boolean randomizeAnswers;

    private EScoringMethod scoringMethod;

    private String password;

    // Either use existing matrix or provide inline matrix items
    private Integer matrixId;

    // Top-level questionBankId for inline items fallback
    private Integer questionBankId;

    // For inline matrix definition
    private List<CreateExamMatrixRequest.MatrixItemRequest> matrixItems;
}
