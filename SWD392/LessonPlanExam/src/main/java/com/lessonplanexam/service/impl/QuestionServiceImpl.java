package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.question.AnswerDTO;
import com.lessonplanexam.dto.question.CreateAnswerRequest;
import com.lessonplanexam.dto.question.CreateQuestionRequest;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.entity.Question;
import com.lessonplanexam.entity.QuestionBank;
import com.lessonplanexam.entity.QuestionDifficulty;
import com.lessonplanexam.entity.QuestionFillBlankAnswer;
import com.lessonplanexam.entity.QuestionMultipleChoiceAnswer;
import com.lessonplanexam.enums.EQuestionType;
import com.lessonplanexam.exception.NotFoundException;
import com.lessonplanexam.repository.QuestionBankRepository;
import com.lessonplanexam.repository.QuestionDifficultyRepository;
import com.lessonplanexam.repository.QuestionRepository;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

        private final QuestionRepository questionRepository;
        private final QuestionBankRepository questionBankRepository;
        private final QuestionDifficultyRepository questionDifficultyRepository;
        private final AccountService accountService;

        @Override
        @Transactional
        public BaseResponse<QuestionDTO> create(CreateQuestionRequest request) {
                QuestionBank questionBank = questionBankRepository.findById(request.getQuestionBankId())
                                .orElseThrow(() -> new NotFoundException("Question Bank not found"));

                Question question = Question.builder()
                                .questionBank(questionBank)
                                .title(request.getTitle())
                                .content(request.getContent())
                                .questionTypeEnum(request.getQuestionType().getValue())
                                .additionalData(request.getAdditionalData())
                                .isActive(true)
                                .build();

                if (request.getQuestionDifficultyId() != null) {
                        QuestionDifficulty difficulty = questionDifficultyRepository
                                        .findById(request.getQuestionDifficultyId())
                                        .orElseThrow(() -> new NotFoundException("Difficulty not found"));
                        question.setQuestionDifficulty(difficulty);
                }

                question = questionRepository.save(question);
                saveAnswers(question, request.getAnswers());

                return BaseResponse.created(mapToDTO(question));
        }

        @Override
        public BaseResponse<QuestionDTO> getById(Integer id) {
                Question question = questionRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Question not found"));
                return BaseResponse.success(mapToDTO(question));
        }

        @Override
        public BaseResponse<PageResponse<QuestionDTO>> getByQuestionBank(Integer questionBankId, Pageable pageable) {
                Page<Question> page = questionRepository.findByQuestionBankId(questionBankId, pageable);
                return BaseResponse.success(PageResponse.from(page.map(this::mapToDTO)));
        }

        @Override
        @Transactional
        public BaseResponse<QuestionDTO> update(Integer id, CreateQuestionRequest request) {
                Question question = questionRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Question not found"));

                question.setTitle(request.getTitle());
                question.setContent(request.getContent());
                question.setQuestionType(request.getQuestionType());
                question.setAdditionalData(request.getAdditionalData());

                if (request.getQuestionDifficultyId() != null) {
                        QuestionDifficulty difficulty = questionDifficultyRepository
                                        .findById(request.getQuestionDifficultyId())
                                        .orElseThrow(() -> new NotFoundException("Difficulty not found"));
                        question.setQuestionDifficulty(difficulty);
                }

                question.getMultipleChoiceAnswers().clear();
                question.getFillBlankAnswers().clear();

                question = questionRepository.save(question);
                saveAnswers(question, request.getAnswers());

                return BaseResponse.success(mapToDTO(question));
        }

        @Override
        @Transactional
        public BaseResponse<Void> delete(Integer id) {
                Question question = questionRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Question not found"));
                question.setDeletedAt(OffsetDateTime.now());
                questionRepository.save(question);
                return BaseResponse.success("Deleted", null);
        }

        private void saveAnswers(Question question, List<CreateAnswerRequest> answers) {
                if (answers == null || answers.isEmpty())
                        return;

                if (question.getQuestionType() == EQuestionType.MULTIPLE_CHOICE) {
                        List<QuestionMultipleChoiceAnswer> mcqAnswers = answers.stream()
                                        .map(a -> {
                                                System.out.println("DEBUG: Saving Answer: " + a.getAnswerText()
                                                                + " | isCorrect: " + a.getIsCorrect());
                                                return QuestionMultipleChoiceAnswer.builder()
                                                                .question(question)
                                                                .answerText(a.getAnswerText())
                                                                .isCorrect(Boolean.TRUE.equals(a.getIsCorrect()))
                                                                .explanation(a.getExplanation())
                                                                .orderIndex(a.getOrderIndex())
                                                                .build();
                                        })
                                        .collect(Collectors.toList());
                        question.getMultipleChoiceAnswers().addAll(mcqAnswers);
                } else if (question.getQuestionType() == EQuestionType.FILL_BLANK) {
                        List<QuestionFillBlankAnswer> fbAnswers = answers.stream()
                                        .map(a -> QuestionFillBlankAnswer.builder()
                                                        .question(question)
                                                        .correctAnswer(a.getAnswerText())
                                                        .normalizedCorrectAnswer(a.getAnswerText().trim().toLowerCase())
                                                        .explanation(a.getExplanation())
                                                        .build())
                                        .collect(Collectors.toList());
                        question.getFillBlankAnswers().addAll(fbAnswers);
                }
                questionRepository.save(question);
        }

        private QuestionDTO mapToDTO(Question question) {
                List<AnswerDTO> answerDTOs = new ArrayList<>();

                if (question.getQuestionType() == EQuestionType.MULTIPLE_CHOICE) {
                        answerDTOs = question.getMultipleChoiceAnswers().stream()
                                        .map(a -> AnswerDTO.builder()
                                                        .id(a.getId())
                                                        .answerText(a.getAnswerText())
                                                        .isCorrect(a.getIsCorrect())
                                                        .explanation(a.getExplanation())
                                                        .orderIndex(a.getOrderIndex())
                                                        .build())
                                        .collect(Collectors.toList());
                } else if (question.getQuestionType() == EQuestionType.FILL_BLANK) {
                        answerDTOs = question.getFillBlankAnswers().stream()
                                        .map(a -> AnswerDTO.builder()
                                                        .id(a.getId())
                                                        .answerText(a.getCorrectAnswer())
                                                        .explanation(a.getExplanation())
                                                        .build())
                                        .collect(Collectors.toList());
                }

                return QuestionDTO.builder()
                                .id(question.getId())
                                .questionBankId(question.getQuestionBank().getId())
                                .questionDifficultyId(
                                                question.getQuestionDifficulty() != null
                                                                ? question.getQuestionDifficulty().getId()
                                                                : null)
                                .difficultyLevel(
                                                question.getQuestionDifficulty() != null
                                                                ? question.getQuestionDifficulty().getDifficultyLevel()
                                                                : null)
                                .title(question.getTitle())
                                .content(question.getContent())
                                .questionType(question.getQuestionType())
                                .additionalData(question.getAdditionalData())
                                .isActive(question.getIsActive())
                                .answers(answerDTOs)
                                .build();
        }

        @Override
        public BaseResponse<List<QuestionDTO>> getByBankAndDifficulty(Integer bankId, Integer difficultyLevel) {
                List<Question> questions = questionRepository.findByBankIdAndDifficulty(bankId, difficultyLevel);
                List<QuestionDTO> dtos = questions.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());
                return BaseResponse.success(dtos);
        }
}
