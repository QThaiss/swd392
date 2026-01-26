package com.lessonplanexam.service;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.lessonplan.CreateLessonPlanRequest;
import com.lessonplanexam.dto.lessonplan.LessonPlanDTO;

import java.util.List;

public interface LessonPlanService {

    BaseResponse<LessonPlanDTO> create(CreateLessonPlanRequest request);

    BaseResponse<LessonPlanDTO> getById(Integer id);

    BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>> getAll(
            org.springframework.data.domain.Pageable pageable);

    BaseResponse<com.lessonplanexam.dto.common.PageResponse<LessonPlanDTO>> getByTeacher(
            org.springframework.data.domain.Pageable pageable);

    BaseResponse<LessonPlanDTO> update(Integer id, CreateLessonPlanRequest request);

    BaseResponse<?> delete(Integer id);
}
