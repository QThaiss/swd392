package com.lessonplanexam.dto.exammatrix;

import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamMatrixDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer teacherId;
    private String teacherName;
    private Integer totalQuestions;
    private BigDecimal totalPoints;
    private List<ExamMatrixItemDTO> matrixItems;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
