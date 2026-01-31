package com.lessonplanexam.dto.exammatrix;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateExamMatrixRequest {

    @NotBlank(message = "Matrix name is required")
    private String name;

    private String description;

    // Top-level questionBankId - used when all items share the same bank
    private Integer questionBankId;

    @NotEmpty(message = "Matrix items are required")
    private List<MatrixItemRequest> matrixItems;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatrixItemRequest {
        // Per-item questionBankId - overrides top-level if provided
        private Integer questionBankId;
        private String domain;

        // Support both Integer difficultyLevel and String difficulty
        private Integer difficultyLevel;
        private String difficulty; // "EASY", "MEDIUM", "HARD"

        private Integer questionCount;
        private BigDecimal pointsPerQuestion;

        // Helper to get the effective difficulty level
        public Integer getEffectiveDifficultyLevel() {
            if (difficultyLevel != null) {
                return difficultyLevel;
            }
            if (difficulty != null) {
                return switch (difficulty.toUpperCase()) {
                    case "EASY" -> 1;
                    case "MEDIUM" -> 2;
                    case "HARD" -> 3;
                    default -> null;
                };
            }
            return null;
        }
    }
}
