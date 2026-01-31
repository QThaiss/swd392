package com.lessonplanexam.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiLessonPlanRequest {
    @NotBlank(message = "Topic is required")
    @JsonProperty("topic")
    private String topic;

    @JsonProperty("subject")
    private String subject;

    @JsonProperty("gradeLevel")
    private String gradeLevel;

    @JsonProperty("additionalInstructions")
    private String additionalInstructions;
}
