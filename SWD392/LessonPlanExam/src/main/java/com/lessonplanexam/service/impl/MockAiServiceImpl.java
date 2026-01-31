package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.ai.AiLessonPlanRequest;
import com.lessonplanexam.dto.ai.AiQuestionRequest;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;
import com.lessonplanexam.dto.question.AnswerDTO;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.enums.EQuestionType;
import com.lessonplanexam.service.AiService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MockAiServiceImpl implements AiService {

    @Override
    public LessonPlanDTO generateLessonPlan(AiLessonPlanRequest request) {
        // Simulate AI processing delay
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String topic = request.getTopic();

        int gradeLevel = 10;
        try {
            if (request.getGradeLevel() != null && !request.getGradeLevel().trim().isEmpty()) {
                gradeLevel = Integer.parseInt(request.getGradeLevel());
            }
        } catch (NumberFormatException e) {
            System.out.println("DEBUG: Invalid grade level format: " + request.getGradeLevel());
            // default to 10
        }

        return LessonPlanDTO.builder()
                .title("Lesson Plan: " + topic)
                .objectives("- Understand the core concepts of " + topic + "\n- Apply " + topic
                        + " in real-world scenarios\n- Analyze case studies related to " + topic)
                .description("Introduction:\nBegin with an engaging activity to introduce " + topic
                        + ".\n\nMain Content:\n1. Definition and History of " + topic
                        + "\n2. Key Principles and Theories\n3. Practical Applications\n\nConclusion:\nReview key points and assign homework on "
                        + topic + ".")
                .gradeLevel(gradeLevel)
                .build();
    }

    @Override
    public List<QuestionDTO> generateQuestions(AiQuestionRequest request) {
        // Simulate AI processing delay
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        List<QuestionDTO> questions = new ArrayList<>();
        String topic = request.getTopic();
        int count = request.getCount() != null ? request.getCount() : 5;

        for (int i = 1; i <= count; i++) {
            QuestionDTO question = QuestionDTO.builder()
                    .title("Generated Question " + i)
                    .content("What is a key characteristic of " + topic + " (Concept " + i + ")?")
                    .questionType(request.getQuestionType())
                    .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : 1)
                    .answers(generateMockAnswers(request.getQuestionType()))
                    .build();
            questions.add(question);
        }

        return questions;
    }

    private List<AnswerDTO> generateMockAnswers(EQuestionType type) {
        List<AnswerDTO> answers = new ArrayList<>();
        if (type == EQuestionType.MULTIPLE_CHOICE) {
            // Generate 4 options with one correct
            answers.add(AnswerDTO.builder().answerText("Option A (Incorrect)").isCorrect(false).build());
            answers.add(AnswerDTO.builder().answerText("Option B (Correct)").isCorrect(true).build());
            answers.add(AnswerDTO.builder().answerText("Option C (Incorrect)").isCorrect(false).build());
            answers.add(AnswerDTO.builder().answerText("Option D (Incorrect)").isCorrect(false).build());
        } else {
            // Fill in blank
            answers.add(AnswerDTO.builder().answerText("Correct Answer").isCorrect(true).build());
        }
        return answers;
    }
}
