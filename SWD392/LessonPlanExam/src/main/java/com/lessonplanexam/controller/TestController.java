package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.OffsetDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public ResponseEntity<BaseResponse<Map<String, Object>>> test() {
        return ResponseEntity.ok(BaseResponse.success(Map.of(
                "message", "LessonPlanExam API is running!",
                "timestamp", OffsetDateTime.now().toString(),
                "version", "1.0.0")));
    }

    @GetMapping("/health")
    public ResponseEntity<BaseResponse<String>> health() {
        return ResponseEntity.ok(BaseResponse.success("healthy", "OK"));
    }
}
