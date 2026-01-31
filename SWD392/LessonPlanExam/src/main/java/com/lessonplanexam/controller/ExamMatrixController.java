package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.exammatrix.CreateExamMatrixRequest;
import com.lessonplanexam.dto.exammatrix.ExamMatrixDTO;
import com.lessonplanexam.dto.exammatrix.MatrixPreviewRequest;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.service.ExamMatrixService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-matrix")
@RequiredArgsConstructor
public class ExamMatrixController {

    private final ExamMatrixService examMatrixService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse<PageResponse<ExamMatrixDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(examMatrixService.getAll(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<PageResponse<ExamMatrixDTO>>> getMyMatrices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(examMatrixService.getMyMatrices(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<ExamMatrixDTO>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(examMatrixService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamMatrixDTO>> create(
            @Valid @RequestBody CreateExamMatrixRequest request) {
        BaseResponse<ExamMatrixDTO> response = examMatrixService.create(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<ExamMatrixDTO>> update(
            @PathVariable Integer id,
            @Valid @RequestBody CreateExamMatrixRequest request) {
        return ResponseEntity.ok(examMatrixService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<Void>> delete(@PathVariable Integer id) {
        return ResponseEntity.ok(examMatrixService.delete(id));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<List<QuestionDTO>>> preview(
            @Valid @RequestBody MatrixPreviewRequest request) {
        return ResponseEntity.ok(examMatrixService.preview(request));
    }
}
