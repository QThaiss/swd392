package com.lessonplanexam.dto.question;

import com.lessonplanexam.enums.EQuestionType;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDTO {
    private Integer id;
    private Integer questionBankId;
    private Integer questionDifficultyId;
    private Integer difficultyLevel;
    private String title;
    private String content;
    private EQuestionType questionType;
    private String additionalData;
    private Boolean isActive;
    private List<AnswerDTO> answers;
}
