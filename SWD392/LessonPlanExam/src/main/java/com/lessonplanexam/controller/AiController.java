package com.lessonplanexam.controller;

import com.lessonplanexam.dto.ai.AiLessonPlanRequest;
import com.lessonplanexam.dto.ai.AiQuestionRequest;
import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/lesson-plan")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<LessonPlanDTO>> generateLessonPlan(
            @Valid @RequestBody AiLessonPlanRequest request) {
        System.out.println("DEBUG: Received AI Lesson Plan Request: " + request);
        try {
            LessonPlanDTO lessonPlan = aiService.generateLessonPlan(request);
            System.out.println("DEBUG: Service returned: " + lessonPlan);
            return ResponseEntity.ok(BaseResponse.success("Lesson plan generated successfully", lessonPlan));
        } catch (Exception e) {
            e.printStackTrace();
            throw e; // Let global handler handle it, but we saw the trace
        }
    }

    @PostMapping("/questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<List<QuestionDTO>>> generateQuestions(
            @Valid @RequestBody AiQuestionRequest request) {
        List<QuestionDTO> questions = aiService.generateQuestions(request);
        return ResponseEntity.ok(BaseResponse.success("Questions generated successfully", questions));
    }
}
