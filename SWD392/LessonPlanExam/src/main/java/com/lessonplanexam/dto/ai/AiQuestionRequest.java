package com.lessonplanexam.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lessonplanexam.enums.EQuestionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiQuestionRequest {
    @NotBlank(message = "Topic is required")
    @JsonProperty("topic")
    private String topic;

    @NotNull(message = "Question type is required")
    @JsonProperty("questionType")
    private EQuestionType questionType;

    @Min(value = 1, message = "Count must be at least 1")
    @Max(value = 20, message = "Count must be at most 20")
    @JsonProperty("count")
    @Builder.Default
    private Integer count = 5;

    @JsonProperty("difficultyLevel")
    private Integer difficultyLevel;
}
