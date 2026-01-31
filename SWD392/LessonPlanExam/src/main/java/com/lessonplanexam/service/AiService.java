package com.lessonplanexam.service;

import com.lessonplanexam.dto.ai.AiLessonPlanRequest;
import com.lessonplanexam.dto.ai.AiQuestionRequest;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;
import com.lessonplanexam.dto.question.QuestionDTO;
import java.util.List;

public interface AiService {
    LessonPlanDTO generateLessonPlan(AiLessonPlanRequest request);

    List<QuestionDTO> generateQuestions(AiQuestionRequest request);
}
