package com.lessonplanexam.controller;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.lessonplan.CreateLessonPlanRequest;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;
import com.lessonplanexam.service.LessonPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lesson-plan")
@RequiredArgsConstructor
public class LessonPlanController {

    private final LessonPlanService lessonPlanService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BaseResponse<LessonPlanDTO>> create(@Valid @RequestBody CreateLessonPlanRequest request) {
        BaseResponse<LessonPlanDTO> response = lessonPlanService.create(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<LessonPlanDTO>> getById(@PathVariable Integer id) {
        BaseResponse<LessonPlanDTO> response = lessonPlanService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortBy).descending()
                : org.springframework.data.domain.Sort.by(sortBy).ascending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        return ResponseEntity.ok(lessonPlanService.getAll(pageable));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>>> getByTeacher(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortBy).descending()
                : org.springframework.data.domain.Sort.by(sortBy).ascending();
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sort);
        return ResponseEntity.ok(lessonPlanService.getByTeacher(pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<LessonPlanDTO>> update(
            @PathVariable Integer id,
            @Valid @RequestBody CreateLessonPlanRequest request) {
        BaseResponse<LessonPlanDTO> response = lessonPlanService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<BaseResponse<?>> delete(@PathVariable Integer id) {
        BaseResponse<?> response = lessonPlanService.delete(id);
        return ResponseEntity.ok(response);
    }
}
