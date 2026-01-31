package com.lessonplanexam.dto.exammatrix;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrixItemDTO {
    private Integer id;
    private Integer questionBankId;
    private String questionBankName;
    private String domain;
    private Integer difficultyLevel;
    private String difficultyName;
    private Integer questionCount;
    private BigDecimal pointsPerQuestion;
}
