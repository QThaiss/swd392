package com.lessonplanexam.dto.question;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnswerDTO {
    private Integer id;
    private String answerText;
    private Boolean isCorrect;
    private String explanation;
    private Integer orderIndex;
}
