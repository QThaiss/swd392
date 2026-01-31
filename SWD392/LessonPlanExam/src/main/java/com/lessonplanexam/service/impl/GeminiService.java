package com.lessonplanexam.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lessonplanexam.dto.ai.AiLessonPlanRequest;
import com.lessonplanexam.dto.ai.AiQuestionRequest;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;
import com.lessonplanexam.dto.question.AnswerDTO;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.enums.EQuestionType;
import com.lessonplanexam.service.AiService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Primary
@RequiredArgsConstructor
public class GeminiService implements AiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    @Override
    public LessonPlanDTO generateLessonPlan(AiLessonPlanRequest request) {
        String prompt = buildLessonPlanPrompt(request);
        String jsonResponse = callGemini(prompt);
        try {
            return objectMapper.readValue(jsonResponse, LessonPlanDTO.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            // Fallback or retry logic could go here
            throw new RuntimeException("Failed to parse AI response for Lesson Plan", e);
        }
    }

    @Override
    public List<QuestionDTO> generateQuestions(AiQuestionRequest request) {
        String prompt = buildQuestionPrompt(request);
        String jsonResponse = callGemini(prompt);
        try {
            List<QuestionDTO> questions = objectMapper.readValue(jsonResponse, new TypeReference<List<QuestionDTO>>() {
            });

            // Post-process to ensure IDs are null (new questions) and structure is valid
            // We can add default values here if Gemini missed something
            return questions;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to parse AI response for Questions", e);
        }
    }

    private String callGemini(String prompt) {
        String url = GEMINI_URL + apiKey;

        GeminiRequest geminiRequest = new GeminiRequest(
                Collections.singletonList(new GeminiRequest.Content(
                        Collections.singletonList(new GeminiRequest.Part(prompt)))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<GeminiRequest> entity = new HttpEntity<>(geminiRequest, headers);

        try {
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(url, entity, GeminiResponse.class);
            if (response.getBody() != null && !response.getBody().getCandidates().isEmpty()) {
                String rawText = response.getBody().getCandidates().get(0).getContent().getParts().get(0).getText();
                return cleanJson(rawText);
            }
        } catch (HttpStatusCodeException e) {
            System.err.println("GEMINI API ERROR: " + e.getResponseBodyAsString());
            e.printStackTrace();
            throw new RuntimeException("Gemini API Error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage());
        }

        throw new RuntimeException("Empty response from Gemini");
    }

    private String cleanJson(String rawText) {
        // Remove markdown code blocks if present
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private String buildLessonPlanPrompt(AiLessonPlanRequest request) {
        return "You are a professional teacher assistant. Create a detailed Lesson Plan in JSON format." +
                "Topic: " + request.getTopic() + "\n" +
                "Subject: " + (request.getSubject() != null ? request.getSubject() : "General") + "\n" +
                "Grade Level: " + request.getGradeLevel() + "\n" +
                "Instructions: "
                + (request.getAdditionalInstructions() != null ? request.getAdditionalInstructions()
                        : "Standard structure")
                + "\n" +
                "Output MUST be a single JSON object matching this structure (no other text):" +
                "{ \"title\": \"Lesson Title\", \"objectives\": \"- Obj 1\\n- Obj 2\", \"description\": \"Detailed content...\", \"gradeLevel\": 10 }"
                +
                "Ensure gradeLevel is an integer.";
    }

    private String buildQuestionPrompt(AiQuestionRequest request) {
        String typeDesc = request.getQuestionType() == EQuestionType.MULTIPLE_CHOICE
                ? "Multiple Choice (4 options, 1 correct)"
                : "Fill in the Blank (valid correct answer)";

        return "You are an exam expert. Generate " + request.getCount() + " " + typeDesc + " questions about '"
                + request.getTopic() + "'." +
                "Difficulty: Level " + request.getDifficultyLevel() + " (1-3)." +
                "Output MUST be a JSON Array of objects matching this Combined structure (no other text):" +
                "[ { \"title\": \"Question Title\", \"content\": \"Question Text\", \"questionType\": \""
                + request.getQuestionType() + "\", " +
                "\"difficultyLevel\": " + request.getDifficultyLevel()
                + ", \"answers\": [ { \"answerText\": \"Answer A\", \"isCorrect\": false, \"explanation\": \"...\" }, ... ] } ]"
                +
                "For Multiple Choice, provide exactly 4 answers with one true. For Fill Blank, provide 1 correct answer.";
    }

    // Inner DTOs for Gemini API
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    private static class GeminiRequest {
        private List<Content> contents;

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Content {
            private List<Part> parts;
        }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Part {
            private String text;
        }
    }

    @Data
    private static class GeminiResponse {
        private List<Candidate> candidates;

        @Data
        public static class Candidate {
            private Content content;
        }

        @Data
        public static class Content {
            private List<Part> parts;
        }

        @Data
        public static class Part {
            private String text;
        }
    }
}
