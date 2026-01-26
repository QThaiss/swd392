package com.lessonplanexam.dto.questionbank;

import com.lessonplanexam.enums.EQuestionBankStatus;
import lombok.*;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionBankDTO {
    private Integer id;
    private String name;
    private Integer gradeLevel;
    private Integer teacherId;
    private String teacherName;
    private String description;
    private EQuestionBankStatus status;
    private Integer questionCount;
    private OffsetDateTime createdAt;
}
