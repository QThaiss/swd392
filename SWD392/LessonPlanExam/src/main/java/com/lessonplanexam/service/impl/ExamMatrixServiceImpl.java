package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.common.PageResponse;
import com.lessonplanexam.dto.exammatrix.CreateExamMatrixRequest;
import com.lessonplanexam.dto.exammatrix.ExamMatrixDTO;
import com.lessonplanexam.dto.exammatrix.ExamMatrixItemDTO;
import com.lessonplanexam.dto.exammatrix.MatrixPreviewRequest;
import com.lessonplanexam.dto.question.AnswerDTO;
import com.lessonplanexam.dto.question.QuestionDTO;
import com.lessonplanexam.entity.*;
import com.lessonplanexam.enums.EQuestionType;
import com.lessonplanexam.exception.ForbiddenException;
import com.lessonplanexam.exception.NotFoundException;
import com.lessonplanexam.repository.*;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.ExamMatrixService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamMatrixServiceImpl implements ExamMatrixService {

        private final ExamMatrixRepository examMatrixRepository;
        private final TeacherRepository teacherRepository;
        private final QuestionBankRepository questionBankRepository;
        private final QuestionRepository questionRepository;
        private final AccountRepository accountRepository;
        private final AccountService accountService;

        @Override
        @Transactional
        public BaseResponse<ExamMatrixDTO> create(CreateExamMatrixRequest request) {
                Integer teacherId = accountService.getCurrentUserId();

                Teacher teacher = teacherRepository.findById(teacherId).orElse(null);
                if (teacher == null) {
                        Account account = accountRepository.findById(teacherId)
                                        .orElseThrow(() -> new NotFoundException("Account not found"));
                        teacher = Teacher.builder()
                                        .account(account)
                                        .schoolName("Default School")
                                        .isActive(true)
                                        .build();
                        teacher = teacherRepository.save(teacher);
                }

                ExamMatrix matrix = ExamMatrix.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .teacher(teacher)
                                .build();

                List<ExamMatrixItem> items = new ArrayList<>();
                int totalQuestions = 0;
                BigDecimal totalPoints = BigDecimal.ZERO;

                // Get top-level questionBankId as fallback
                Integer defaultQuestionBankId = request.getQuestionBankId();

                for (CreateExamMatrixRequest.MatrixItemRequest itemReq : request.getMatrixItems()) {
                        // Use item-level questionBankId, or fall back to top-level
                        Integer bankId = itemReq.getQuestionBankId() != null
                                        ? itemReq.getQuestionBankId()
                                        : defaultQuestionBankId;

                        if (bankId == null) {
                                throw new IllegalArgumentException("Question bank ID is required");
                        }

                        QuestionBank questionBank = questionBankRepository.findById(bankId)
                                        .orElseThrow(() -> new NotFoundException("Question Bank not found: " + bankId));

                        // Use effective difficulty level (supports both Integer and String)
                        Integer diffLevel = itemReq.getEffectiveDifficultyLevel();

                        ExamMatrixItem item = ExamMatrixItem.builder()
                                        .examMatrix(matrix)
                                        .questionBank(questionBank)
                                        .domain(itemReq.getDomain())
                                        .difficultyLevel(diffLevel)
                                        .questionCount(itemReq.getQuestionCount())
                                        .pointsPerQuestion(itemReq.getPointsPerQuestion() != null
                                                        ? itemReq.getPointsPerQuestion()
                                                        : BigDecimal.ONE)
                                        .build();
                        items.add(item);

                        totalQuestions += itemReq.getQuestionCount();
                        totalPoints = totalPoints.add(
                                        (itemReq.getPointsPerQuestion() != null ? itemReq.getPointsPerQuestion()
                                                        : BigDecimal.ONE)
                                                        .multiply(BigDecimal.valueOf(itemReq.getQuestionCount())));
                }

                matrix.setMatrixItems(items);
                matrix.setTotalQuestions(totalQuestions);
                matrix.setTotalPoints(totalPoints);

                matrix = examMatrixRepository.save(matrix);
                return BaseResponse.created(mapToDTO(matrix));
        }

        @Override
        public BaseResponse<ExamMatrixDTO> getById(Integer id) {
                ExamMatrix matrix = examMatrixRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Exam Matrix not found"));
                if (matrix.getDeletedAt() != null) {
                        throw new NotFoundException("Exam Matrix not found");
                }
                return BaseResponse.success(mapToDTO(matrix));
        }

        @Override
        public BaseResponse<PageResponse<ExamMatrixDTO>> getAll(Pageable pageable) {
                Page<ExamMatrix> page = examMatrixRepository.findAll(pageable);
                List<ExamMatrixDTO> dtos = page.getContent().stream()
                                .filter(m -> m.getDeletedAt() == null)
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());

                Page<ExamMatrixDTO> dtoPage = new PageImpl<>(dtos, pageable, page.getTotalElements());
                return BaseResponse.success(PageResponse.from(dtoPage));
        }

        @Override
        public BaseResponse<PageResponse<ExamMatrixDTO>> getMyMatrices(Pageable pageable) {
                Integer teacherId = accountService.getCurrentUserId();
                List<ExamMatrix> matrices = examMatrixRepository.findByTeacherId(teacherId);

                List<ExamMatrixDTO> dtos = matrices.stream()
                                .map(this::mapToDTO)
                                .collect(Collectors.toList());

                int start = (int) pageable.getOffset();
                int end = Math.min(start + pageable.getPageSize(), dtos.size());
                List<ExamMatrixDTO> pageContent = start < dtos.size() ? dtos.subList(start, end) : new ArrayList<>();

                Page<ExamMatrixDTO> page = new PageImpl<>(pageContent, pageable, dtos.size());
                return BaseResponse.success(PageResponse.from(page));
        }

        @Override
        @Transactional
        public BaseResponse<ExamMatrixDTO> update(Integer id, CreateExamMatrixRequest request) {
                Integer teacherId = accountService.getCurrentUserId();
                boolean isAdmin = accountService.isCurrentUserAdmin();

                ExamMatrix matrix = examMatrixRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Exam Matrix not found"));

                if (!isAdmin && !matrix.getTeacher().getAccountId().equals(teacherId)) {
                        throw new ForbiddenException("You can only update your own matrices");
                }

                matrix.setName(request.getName());
                matrix.setDescription(request.getDescription());

                matrix.getMatrixItems().clear();

                List<ExamMatrixItem> items = new ArrayList<>();
                int totalQuestions = 0;
                BigDecimal totalPoints = BigDecimal.ZERO;

                // Get top-level questionBankId as fallback
                Integer defaultQuestionBankId = request.getQuestionBankId();

                for (CreateExamMatrixRequest.MatrixItemRequest itemReq : request.getMatrixItems()) {
                        // Use item-level questionBankId, or fall back to top-level
                        Integer bankId = itemReq.getQuestionBankId() != null
                                        ? itemReq.getQuestionBankId()
                                        : defaultQuestionBankId;

                        if (bankId == null) {
                                throw new IllegalArgumentException("Question bank ID is required");
                        }

                        QuestionBank questionBank = questionBankRepository.findById(bankId)
                                        .orElseThrow(() -> new NotFoundException("Question Bank not found: " + bankId));

                        // Use effective difficulty level (supports both Integer and String)
                        Integer diffLevel = itemReq.getEffectiveDifficultyLevel();

                        ExamMatrixItem item = ExamMatrixItem.builder()
                                        .examMatrix(matrix)
                                        .questionBank(questionBank)
                                        .domain(itemReq.getDomain())
                                        .difficultyLevel(diffLevel)
                                        .questionCount(itemReq.getQuestionCount())
                                        .pointsPerQuestion(itemReq.getPointsPerQuestion() != null
                                                        ? itemReq.getPointsPerQuestion()
                                                        : BigDecimal.ONE)
                                        .build();
                        items.add(item);

                        totalQuestions += itemReq.getQuestionCount();
                        totalPoints = totalPoints.add(
                                        (itemReq.getPointsPerQuestion() != null ? itemReq.getPointsPerQuestion()
                                                        : BigDecimal.ONE)
                                                        .multiply(BigDecimal.valueOf(itemReq.getQuestionCount())));
                }

                matrix.getMatrixItems().addAll(items);
                matrix.setTotalQuestions(totalQuestions);
                matrix.setTotalPoints(totalPoints);

                matrix = examMatrixRepository.save(matrix);
                return BaseResponse.success("Matrix updated", mapToDTO(matrix));
        }

        @Override
        @Transactional
        public BaseResponse<Void> delete(Integer id) {
                Integer teacherId = accountService.getCurrentUserId();
                boolean isAdmin = accountService.isCurrentUserAdmin();

                ExamMatrix matrix = examMatrixRepository.findById(id)
                                .orElseThrow(() -> new NotFoundException("Exam Matrix not found"));

                if (!isAdmin && !matrix.getTeacher().getAccountId().equals(teacherId)) {
                        throw new ForbiddenException("You can only delete your own matrices");
                }

                matrix.setDeletedAt(OffsetDateTime.now());
                examMatrixRepository.save(matrix);
                return BaseResponse.success("Matrix deleted", null);
        }

        @Override
        public BaseResponse<List<QuestionDTO>> preview(MatrixPreviewRequest request) {
                List<QuestionDTO> previewQuestions = new ArrayList<>();

                // Get top-level questionBankId as fallback
                Integer defaultQuestionBankId = request.getQuestionBankId();

                for (CreateExamMatrixRequest.MatrixItemRequest item : request.getMatrixItems()) {
                        // Use item-level questionBankId, or fall back to top-level
                        Integer bankId = item.getQuestionBankId() != null
                                        ? item.getQuestionBankId()
                                        : defaultQuestionBankId;

                        // Use effective difficulty level
                        Integer diffLevel = item.getEffectiveDifficultyLevel();

                        List<Question> randomQuestions = questionRepository.findRandomQuestionsByBankAndDifficulty(
                                        bankId,
                                        diffLevel,
                                        item.getQuestionCount());

                        for (Question q : randomQuestions) {
                                previewQuestions.add(mapQuestionToDTO(q));
                        }
                }

                return BaseResponse.success(previewQuestions);
        }

        private ExamMatrixDTO mapToDTO(ExamMatrix matrix) {
                List<ExamMatrixItemDTO> itemDTOs = matrix.getMatrixItems().stream()
                                .map(item -> ExamMatrixItemDTO.builder()
                                                .id(item.getId())
                                                .questionBankId(item.getQuestionBank().getId())
                                                .questionBankName(item.getQuestionBank().getName())
                                                .domain(item.getDomain())
                                                .difficultyLevel(item.getDifficultyLevel())
                                                .difficultyName(getDifficultyName(item.getDifficultyLevel()))
                                                .questionCount(item.getQuestionCount())
                                                .pointsPerQuestion(item.getPointsPerQuestion())
                                                .build())
                                .collect(Collectors.toList());

                String teacherName = null;
                if (matrix.getTeacher() != null && matrix.getTeacher().getAccount() != null) {
                        teacherName = matrix.getTeacher().getAccount().getFullName();
                }

                return ExamMatrixDTO.builder()
                                .id(matrix.getId())
                                .name(matrix.getName())
                                .description(matrix.getDescription())
                                .teacherId(matrix.getTeacher().getAccountId())
                                .teacherName(teacherName)
                                .totalQuestions(matrix.getTotalQuestions())
                                .totalPoints(matrix.getTotalPoints())
                                .matrixItems(itemDTOs)
                                .createdAt(matrix.getCreatedAt())
                                .updatedAt(matrix.getUpdatedAt())
                                .build();
        }

        private String getDifficultyName(Integer level) {
                if (level == null)
                        return "Unknown";
                return switch (level) {
                        case 1 -> "Easy";
                        case 2 -> "Medium";
                        case 3 -> "Hard";
                        default -> "Level " + level;
                };
        }

        private QuestionDTO mapQuestionToDTO(Question question) {
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
}
