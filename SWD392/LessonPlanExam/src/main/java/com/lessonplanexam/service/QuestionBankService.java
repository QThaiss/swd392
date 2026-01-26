package com.lessonplanexam.service;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.questionbank.CreateQuestionBankRequest;
import com.lessonplanexam.dto.questionbank.QuestionBankDTO;

import java.util.List;

public interface QuestionBankService {

    BaseResponse<QuestionBankDTO> create(CreateQuestionBankRequest request);

    BaseResponse<QuestionBankDTO> getById(Integer id);

    BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>> getAll(
            org.springframework.data.domain.Pageable pageable);

    BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>> getByTeacher(
            org.springframework.data.domain.Pageable pageable);

    BaseResponse<QuestionBankDTO> update(Integer id, CreateQuestionBankRequest request);

    BaseResponse<?> delete(Integer id);
}
