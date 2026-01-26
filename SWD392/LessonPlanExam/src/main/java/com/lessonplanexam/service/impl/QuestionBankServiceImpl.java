package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.questionbank.CreateQuestionBankRequest;
import com.lessonplanexam.dto.questionbank.QuestionBankDTO;
import com.lessonplanexam.entity.QuestionBank;
import com.lessonplanexam.entity.Teacher;
import com.lessonplanexam.enums.EQuestionBankStatus;
import com.lessonplanexam.exception.ForbiddenException;
import com.lessonplanexam.exception.NotFoundException;
import com.lessonplanexam.repository.QuestionBankRepository;
import com.lessonplanexam.repository.TeacherRepository;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.QuestionBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionBankServiceImpl implements QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final TeacherRepository teacherRepository;
    private final AccountService accountService;
    private final com.lessonplanexam.repository.AccountRepository accountRepository;

    @Override
    @Transactional
    public BaseResponse<QuestionBankDTO> create(CreateQuestionBankRequest request) {
        Integer teacherId = accountService.getCurrentUserId();

        Teacher teacher = teacherRepository.findById(teacherId).orElse(null);

        if (teacher == null) {
            String role = accountService.getCurrentUserRole();
            if (accountService.isCurrentUserAdmin() || "TEACHER".equals(role)) {
                com.lessonplanexam.entity.Account account = accountRepository.findById(teacherId)
                        .orElseThrow(() -> new NotFoundException("Account not found"));
                teacher = Teacher.builder()
                        .account(account)
                        .schoolName(accountService.isCurrentUserAdmin() ? "System Admin School" : "Default School")
                        .isActive(true)
                        .build();
                teacher = teacherRepository.save(teacher);
            } else {
                throw new ForbiddenException("Only teachers can create question banks. Your role is: " + role);
            }
        }

        QuestionBank questionBank = QuestionBank.builder()
                .name(request.getName())
                .gradeLevel(request.getGradeLevel())
                .teacher(teacher)
                .description(request.getDescription())
                .build();
        questionBank.setStatus(EQuestionBankStatus.DRAFT);

        questionBank = questionBankRepository.save(questionBank);

        return BaseResponse.created(mapToDTO(questionBank));
    }

    @Override
    public BaseResponse<QuestionBankDTO> getById(Integer id) {
        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question bank not found"));

        if (questionBank.getDeletedAt() != null) {
            throw new NotFoundException("Question bank not found");
        }

        return BaseResponse.success(mapToDTO(questionBank));
    }

    @Override
    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>> getAll(
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<QuestionBank> page = questionBankRepository.findAllActive(pageable);
        org.springframework.data.domain.Page<QuestionBankDTO> dtoPage = page.map(this::mapToDTO);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(dtoPage));
    }

    @Override
    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<QuestionBankDTO>> getByTeacher(
            org.springframework.data.domain.Pageable pageable) {
        Integer teacherId = accountService.getCurrentUserId();
        org.springframework.data.domain.Page<QuestionBank> page = questionBankRepository.findByTeacherId(teacherId,
                pageable);
        org.springframework.data.domain.Page<QuestionBankDTO> dtoPage = page.map(this::mapToDTO);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(dtoPage));
    }

    @Override
    @Transactional
    public BaseResponse<QuestionBankDTO> update(Integer id, CreateQuestionBankRequest request) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question bank not found"));

        if (!isAdmin && !questionBank.getTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only update your own question banks");
        }

        questionBank.setName(request.getName());
        questionBank.setGradeLevel(request.getGradeLevel());
        questionBank.setDescription(request.getDescription());

        questionBank = questionBankRepository.save(questionBank);

        return BaseResponse.success("Question bank updated", mapToDTO(questionBank));
    }

    @Override
    @Transactional
    public BaseResponse<?> delete(Integer id) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        QuestionBank questionBank = questionBankRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question bank not found"));

        if (!isAdmin && !questionBank.getTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only delete your own question banks");
        }

        questionBank.setDeletedAt(OffsetDateTime.now());
        questionBankRepository.save(questionBank);

        return BaseResponse.success("Question bank deleted", null);
    }

    private QuestionBankDTO mapToDTO(QuestionBank questionBank) {
        return QuestionBankDTO.builder()
                .id(questionBank.getId())
                .name(questionBank.getName())
                .gradeLevel(questionBank.getGradeLevel())
                .teacherId(questionBank.getTeacher().getAccountId())
                .teacherName(questionBank.getTeacher().getAccount() != null
                        ? questionBank.getTeacher().getAccount().getFullName()
                        : null)
                .description(questionBank.getDescription())
                .status(questionBank.getStatus())
                .questionCount(questionBank.getQuestions() != null ? questionBank.getQuestions().size() : 0)
                .createdAt(questionBank.getCreatedAt())
                .build();
    }
}
