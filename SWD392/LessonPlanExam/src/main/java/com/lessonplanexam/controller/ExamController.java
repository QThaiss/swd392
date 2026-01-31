package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.exam.*;
import com.lessonplanexam.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ExamDTO>> create(@Valid @RequestBody CreateExamRequest request) {
        BaseResponse<ExamDTO> response = examService.create(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<ExamDTO>> getById(@PathVariable Integer id) {
        BaseResponse<ExamDTO> response = examService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<PageResponse<ExamDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(examService.getAll(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<PageResponse<ExamDTO>>> getByTeacher(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(examService.getByTeacher(pageable));
    }

    @GetMapping("/active")
    public ResponseEntity<BaseResponse<PageResponse<ExamDTO>>> getActiveExams(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(examService.getActiveExams(pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamDTO>> update(
            @PathVariable Integer id,
            @Valid @RequestBody CreateExamRequest request) {
        BaseResponse<ExamDTO> response = examService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> delete(@PathVariable Integer id) {
        BaseResponse<?> response = examService.delete(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> activate(@PathVariable Integer id) {
        BaseResponse<?> response = examService.activate(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> deactivate(@PathVariable Integer id) {
        BaseResponse<?> response = examService.deactivate(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ExamAttemptDTO>> startExam(@PathVariable Integer id) {
        return ResponseEntity.ok(examService.startExam(id));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ExamAttemptDTO>> submitExam(
            @PathVariable Integer id,
            @RequestBody SubmitExamRequest request) {
        return ResponseEntity.ok(examService.submitExam(id, request));
    }

    @GetMapping("/{id}/attempts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<java.util.List<ExamAttemptDTO>>> getMyAttempts(@PathVariable Integer id) {
        return ResponseEntity.ok(examService.getMyAttempts(id));
    }

    // ==================== NEW ENDPOINTS ====================

    // Question Management
    @PostMapping("/{examId}/questions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamQuestionsResponse>> addQuestionsToExam(
            @PathVariable Integer examId,
            @Valid @RequestBody AddQuestionsToExamRequest request) {
        return ResponseEntity.ok(examService.addQuestionsToExam(examId, request));
    }

    @GetMapping("/{examId}/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ExamQuestionsResponse>> getExamQuestions(
            @PathVariable Integer examId) {
        return ResponseEntity.ok(examService.getExamQuestions(examId));
    }

    @DeleteMapping("/{examId}/questions/{questionId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> removeQuestionFromExam(
            @PathVariable Integer examId,
            @PathVariable Integer questionId) {
        return ResponseEntity.ok(examService.removeQuestionFromExam(examId, questionId));
    }

    // Publish / Draft Status
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamDTO>> publish(@PathVariable Integer id) {
        return ResponseEntity.ok(examService.publish(id));
    }

    @PostMapping("/{id}/draft")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamDTO>> saveToDraft(@PathVariable Integer id) {
        return ResponseEntity.ok(examService.saveToDraft(id));
    }

    // Create from Matrix
    @PostMapping("/from-matrix")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamDTO>> createFromMatrix(
            @Valid @RequestBody CreateExamFromMatrixRequest request) {
        BaseResponse<ExamDTO> response = examService.createFromMatrix(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }
}
