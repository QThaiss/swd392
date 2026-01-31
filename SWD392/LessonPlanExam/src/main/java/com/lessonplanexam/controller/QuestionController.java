package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.question.CreateQuestionRequest;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Validated
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public BaseResponse<QuestionDTO> create(@RequestBody @Validated CreateQuestionRequest request) {
        return questionService.create(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<QuestionDTO> getById(@PathVariable Integer id) {
        return questionService.getById(id);
    }

    @GetMapping("/bank/{bankId}")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<PageResponse<QuestionDTO>> getByQuestionBank(
            @PathVariable Integer bankId,
            Pageable pageable) {
        return questionService.getByQuestionBank(bankId, pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public BaseResponse<QuestionDTO> update(
            @PathVariable Integer id,
            @RequestBody @Validated CreateQuestionRequest request) {
        return questionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public BaseResponse<Void> delete(@PathVariable Integer id) {
        return questionService.delete(id);
    }

    // New endpoint for getting questions by difficulty
    @GetMapping("/bank/{bankId}/difficulty/{difficultyLevel}")
    @PreAuthorize("isAuthenticated()")
    public BaseResponse<List<QuestionDTO>> getByBankAndDifficulty(
            @PathVariable Integer bankId,
            @PathVariable Integer difficultyLevel) {
        return questionService.getByBankAndDifficulty(bankId, difficultyLevel);
    }
}
