package com.lessonplanexam.dto.lessonplan;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLessonPlanRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String objectives;

    private String description;

    private String imageUrl;

    @NotNull(message = "Grade level is required")
    @Min(value = 1, message = "Grade level must be between 1 and 12")
    @Max(value = 12, message = "Grade level must be between 1 and 12")
    private Integer gradeLevel;
}
