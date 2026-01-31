package com.lessonplanexam.dto.exammatrix;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatrixPreviewRequest {

    // Top-level questionBankId - used when all items share the same bank
    private Integer questionBankId;

    @NotEmpty(message = "Matrix items are required for preview")
    private List<CreateExamMatrixRequest.MatrixItemRequest> matrixItems;
}
