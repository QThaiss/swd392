package com.lessonplanexam.dto.exam;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddQuestionsToExamRequest {

    @NotEmpty(message = "Question IDs are required")
    private List<QuestionWithPoints> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionWithPoints {
        private Integer questionId;
        private BigDecimal points;
    }
}
