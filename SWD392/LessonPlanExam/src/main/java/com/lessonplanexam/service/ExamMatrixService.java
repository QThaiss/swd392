package com.lessonplanexam.service;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.exammatrix.CreateExamMatrixRequest;
import com.lessonplanexam.dto.exammatrix.ExamMatrixDTO;
import com.lessonplanexam.dto.exammatrix.MatrixPreviewRequest;
import com.lessonplanexam.dto.question.QuestionDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ExamMatrixService {

    BaseResponse<ExamMatrixDTO> create(CreateExamMatrixRequest request);

    BaseResponse<ExamMatrixDTO> getById(Integer id);

    BaseResponse<PageResponse<ExamMatrixDTO>> getAll(Pageable pageable);

    BaseResponse<PageResponse<ExamMatrixDTO>> getMyMatrices(Pageable pageable);

    BaseResponse<ExamMatrixDTO> update(Integer id, CreateExamMatrixRequest request);

    BaseResponse<Void> delete(Integer id);

    BaseResponse<List<QuestionDTO>> preview(MatrixPreviewRequest request);
}
