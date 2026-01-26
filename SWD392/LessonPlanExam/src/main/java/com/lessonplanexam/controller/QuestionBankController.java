package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.questionbank.CreateQuestionBankRequest;
import com.lessonplanexam.dto.questionbank.QuestionBankDTO;
import com.lessonplanexam.service.QuestionBankService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/question-bank")
@RequiredArgsConstructor
public class QuestionBankController {

    private final QuestionBankService questionBankService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<QuestionBankDTO>> create(@Valid @RequestBody CreateQuestionBankRequest request) {
        BaseResponse<QuestionBankDTO> response = questionBankService.create(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<QuestionBankDTO>> getById(@PathVariable Integer id) {
        BaseResponse<QuestionBankDTO> response = questionBankService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortBy).descending()
                : org.springframework.data.domain.Sort.by(sortBy).ascending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        return ResponseEntity.ok(questionBankService.getAll(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>>> getByTeacher(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortBy).descending()
                : org.springframework.data.domain.Sort.by(sortBy).ascending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        return ResponseEntity.ok(questionBankService.getByTeacher(pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<QuestionBankDTO>> update(
            @PathVariable Integer id,
            @Valid @RequestBody CreateQuestionBankRequest request) {
        BaseResponse<QuestionBankDTO> response = questionBankService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> delete(@PathVariable Integer id) {
        BaseResponse<?> response = questionBankService.delete(id);
        return ResponseEntity.ok(response);
    }
}
