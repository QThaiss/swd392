package com.lessonplanexam.dto.exam;

import com.lessonplanexam.enums.EScoringMethod;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExamRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private Integer examMatrixId;

    @Min(value = 1, message = "Grade level must be between 1 and 12")
    @Max(value = 12, message = "Grade level must be between 1 and 12")
    private Integer gradeLevel;

    private String description;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    private String password;

    private Integer maxAttempts;

    private EScoringMethod scoringMethod;

    private Boolean showResultsImmediately;

    private Boolean showCorrectAnswers;

    private Boolean randomizeQuestions;

    private Boolean randomizeAnswers;

    private BigDecimal passThreshold;
}
