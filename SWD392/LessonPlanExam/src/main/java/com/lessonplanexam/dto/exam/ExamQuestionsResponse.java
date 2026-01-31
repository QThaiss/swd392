package com.lessonplanexam.dto.exam;

import com.lessonplanexam.dto.question.QuestionDTO;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamQuestionsResponse {
    private Integer examId;
    private String examTitle;
    private Integer totalQuestions;
    private List<ExamQuestionDTO> questions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExamQuestionDTO {
        private Integer id;
        private Integer orderIndex;
        private java.math.BigDecimal points;
        private QuestionDTO question;
    }
}
