package com.lessonplanexam.dto.exam;

import com.lessonplanexam.enums.EExamStatus;
import com.lessonplanexam.enums.EScoringMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamDTO {
    private Integer id;
    private String title;
    private Integer createdByTeacherId;
    private String teacherName;
    private Integer examMatrixId;
    private Integer gradeLevel;
    private String description;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer durationMinutes;
    private Integer maxAttempts;
    private EScoringMethod scoringMethod;
    private Boolean showResultsImmediately;
    private Boolean showCorrectAnswers;
    private Boolean randomizeQuestions;
    private Boolean randomizeAnswers;
    private EExamStatus status;
    private Integer totalQuestions;
    private BigDecimal totalPoints;
    private BigDecimal passThreshold;
    private OffsetDateTime createdAt;
}
