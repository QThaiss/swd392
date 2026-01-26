package com.lessonplanexam.service;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.dto.question.CreateQuestionRequest;
import org.springframework.data.domain.Pageable;

public interface QuestionService {
    BaseResponse<QuestionDTO> create(CreateQuestionRequest request);

    BaseResponse<QuestionDTO> getById(Integer id);

    BaseResponse<PageResponse<QuestionDTO>> getByQuestionBank(Integer questionBankId, Pageable pageable);

    BaseResponse<QuestionDTO> update(Integer id, CreateQuestionRequest request);

    BaseResponse<Void> delete(Integer id);
}
