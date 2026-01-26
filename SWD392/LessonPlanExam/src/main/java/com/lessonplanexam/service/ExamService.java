package com.lessonplanexam.service;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.exam.CreateExamRequest;
import com.lessonplanexam.dto.exam.ExamAttemptDTO;
import com.lessonplanexam.dto.exam.ExamDTO;
import com.lessonplanexam.dto.exam.SubmitExamRequest;

public interface ExamService {

        BaseResponse<ExamDTO> create(CreateExamRequest request);

        BaseResponse<ExamDTO> getById(Integer id);

        BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getAll(
                        org.springframework.data.domain.Pageable pageable);

        BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getByTeacher(
                        org.springframework.data.domain.Pageable pageable);

        BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getActiveExams(
                        org.springframework.data.domain.Pageable pageable);

        BaseResponse<ExamDTO> update(Integer id, CreateExamRequest request);

        BaseResponse<?> delete(Integer id);

        BaseResponse<?> activate(Integer id);

        BaseResponse<?> deactivate(Integer id);

        BaseResponse<ExamAttemptDTO> startExam(Integer examId);

        BaseResponse<ExamAttemptDTO> submitExam(Integer examId, SubmitExamRequest request);
}
