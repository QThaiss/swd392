package com.lessonplanexam.dto.exam;

import com.lessonplanexam.enums.EAttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttemptDTO {
    private Integer id;
    private Integer examId;
    private Integer studentId;
    private Integer attemptNumber;
    private OffsetDateTime startedAt;
    private OffsetDateTime submittedAt;
    private Integer timeSpentSeconds;
    private BigDecimal totalScore;
    private BigDecimal maxScore;
    private BigDecimal scorePercentage;
    private EAttemptStatus status;
}
