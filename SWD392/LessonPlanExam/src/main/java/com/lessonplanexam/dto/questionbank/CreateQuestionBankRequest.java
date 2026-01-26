package com.lessonplanexam.dto.questionbank;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateQuestionBankRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Grade level is required")
    @Min(value = 1, message = "Grade level must be between 1 and 12")
    @Max(value = 12, message = "Grade level must be between 1 and 12")
    private Integer gradeLevel;

    private String description;
}
