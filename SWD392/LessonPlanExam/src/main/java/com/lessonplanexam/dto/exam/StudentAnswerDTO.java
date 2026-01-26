package com.lessonplanexam.dto.exam;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnswerDTO {
    private Integer questionId;
    // For MCQ: answerId (if picking from options) or answerText/orderIndex
    // Let's assume for MCQ we send answerId if we mapped it, or the text/index?
    // QuestionMultipleChoiceAnswer has ID.
    private Integer selectedAnswerId;

    // For Fill Blank
    private String textAnswer;
}
