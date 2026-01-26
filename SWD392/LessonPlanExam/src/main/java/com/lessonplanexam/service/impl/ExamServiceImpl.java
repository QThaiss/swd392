package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.exam.CreateExamRequest;
import com.lessonplanexam.dto.exam.ExamAttemptDTO;
import com.lessonplanexam.dto.exam.ExamDTO;
import com.lessonplanexam.dto.exam.SubmitExamRequest;
import com.lessonplanexam.dto.exam.StudentAnswerDTO;
import com.lessonplanexam.entity.*;
import com.lessonplanexam.enums.EAttemptStatus;
import com.lessonplanexam.enums.EExamStatus;
import com.lessonplanexam.enums.EQuestionType;
import com.lessonplanexam.exception.ForbiddenException;
import com.lessonplanexam.exception.NotFoundException;
import com.lessonplanexam.repository.*;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final TeacherRepository teacherRepository;
    private final ExamMatrixRepository examMatrixRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountService accountService;
    private final com.lessonplanexam.repository.AccountRepository accountRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final StudentRepository studentRepository;

    @Override
    @Transactional
    public BaseResponse<ExamDTO> create(CreateExamRequest request) {
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
                throw new ForbiddenException(
                        "Only teachers can create exams. Your role is: " + role);
            }
        }

        ExamMatrix examMatrix = null;
        if (request.getExamMatrixId() != null) {
            examMatrix = examMatrixRepository.findById(request.getExamMatrixId())
                    .orElseThrow(() -> new NotFoundException("Exam matrix not found"));
        }

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .createdByTeacher(teacher)
                .examMatrix(examMatrix)
                .gradeLevel(request.getGradeLevel())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .maxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 1)
                .showResultsImmediately(request.getShowResultsImmediately())
                .showCorrectAnswers(request.getShowCorrectAnswers())
                .randomizeQuestions(request.getRandomizeQuestions())
                .randomizeAnswers(request.getRandomizeAnswers())
                .passThreshold(request.getPassThreshold())
                .build();

        exam.setStatus(EExamStatus.DRAFT);
        if (request.getScoringMethod() != null)
            exam.setScoringMethod(request.getScoringMethod());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            exam.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (examMatrix != null) {
            List<ExamQuestion> generatedQuestions = new ArrayList<>();
            int orderIndex = 0;
            for (ExamMatrixItem item : examMatrix.getMatrixItems()) {
                List<Question> randomQuestions = questionRepository
                        .findRandomQuestionsByBankAndDifficulty(
                                item.getQuestionBank().getId(),
                                item.getDifficultyLevel(),
                                item.getQuestionCount());
                for (Question q : randomQuestions) {
                    generatedQuestions.add(ExamQuestion.builder()
                            .exam(exam)
                            .question(q)
                            .orderIndex(orderIndex++)
                            .points(item.getPointsPerQuestion())
                            .build());
                }
            }
            exam.setExamQuestions(generatedQuestions);
            exam.setTotalQuestions(generatedQuestions.size());
            exam.setTotalPoints(generatedQuestions.stream()
                    .map(ExamQuestion::getPoints)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
        }

        exam = examRepository.save(exam);
        return BaseResponse.created(mapToDTO(exam));
    }

    @Override
    public BaseResponse<ExamDTO> getById(Integer id) {
        Exam exam = examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
        if (exam.getDeletedAt() != null)
            throw new NotFoundException("Exam not found");
        return BaseResponse.success(mapToDTO(exam));
    }

    @Override
    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getAll(
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Exam> page = examRepository.findAllActive(pageable);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(page.map(this::mapToDTO)));
    }

    @Override
    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getByTeacher(
            org.springframework.data.domain.Pageable pageable) {
        Integer teacherId = accountService.getCurrentUserId();
        org.springframework.data.domain.Page<Exam> page = examRepository.findByTeacherId(teacherId, pageable);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(page.map(this::mapToDTO)));
    }

    @Override
    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<ExamDTO>> getActiveExams(
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Exam> page = examRepository.findByStatus(EExamStatus.ACTIVE.getValue(),
                pageable);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(page.map(this::mapToDTO)));
    }

    @Override
    @Transactional
    public BaseResponse<ExamDTO> update(Integer id, CreateExamRequest request) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();
        Exam exam = examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only update your own exams");
        }
        exam.setTitle(request.getTitle());
        exam.setGradeLevel(request.getGradeLevel());
        exam.setDescription(request.getDescription());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setMaxAttempts(request.getMaxAttempts());
        exam.setShowResultsImmediately(request.getShowResultsImmediately());
        exam.setShowCorrectAnswers(request.getShowCorrectAnswers());
        exam.setRandomizeQuestions(request.getRandomizeQuestions());
        exam.setRandomizeAnswers(request.getRandomizeAnswers());
        exam.setPassThreshold(request.getPassThreshold());
        if (request.getScoringMethod() != null)
            exam.setScoringMethod(request.getScoringMethod());
        exam = examRepository.save(exam);
        return BaseResponse.success("Exam updated", mapToDTO(exam));
    }

    @Override
    @Transactional
    public BaseResponse<?> delete(Integer id) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();
        Exam exam = examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only delete your own exams");
        }
        exam.setDeletedAt(OffsetDateTime.now());
        examRepository.save(exam);
        return BaseResponse.success("Exam deleted", null);
    }

    @Override
    @Transactional
    public BaseResponse<?> activate(Integer id) {
        return changeStatus(id, EExamStatus.ACTIVE);
    }

    @Override
    @Transactional
    public BaseResponse<?> deactivate(Integer id) {
        return changeStatus(id, EExamStatus.INACTIVE);
    }

    private BaseResponse<?> changeStatus(Integer id, EExamStatus status) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();
        Exam exam = examRepository.findById(id).orElseThrow(() -> new NotFoundException("Exam not found"));
        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only change status of your own exams");
        }
        exam.setStatus(status);
        examRepository.save(exam);
        return BaseResponse.success("Exam status updated", null);
    }

    @Override
    @Transactional
    public BaseResponse<ExamAttemptDTO> startExam(Integer examId) {
        Integer studentId = accountService.getCurrentUserId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student profile not found. Please contact admin."));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (exam.getStatus() != EExamStatus.ACTIVE) {
            throw new ForbiddenException("Exam is not active");
        }

        long attemptsCount = examAttemptRepository.countByExamIdAndStudentId(examId, studentId);
        if (attemptsCount >= exam.getMaxAttempts()) {
            throw new ForbiddenException("Max attempts reached");
        }

        ExamAttempt attempt = ExamAttempt.builder()
                .exam(exam)
                .student(student)
                .attemptNumber((int) attemptsCount + 1)
                .startedAt(OffsetDateTime.now())
                .status(EAttemptStatus.IN_PROGRESS)
                .build();

        attempt = examAttemptRepository.save(attempt);
        return BaseResponse.success(mapAttemptToDTO(attempt));
    }

    @Override
    @Transactional
    public BaseResponse<ExamAttemptDTO> submitExam(Integer examId, SubmitExamRequest request) {
        Integer studentId = accountService.getCurrentUserId();
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        ExamAttempt attempt = examAttemptRepository.findByExamIdAndStudentIdAndStatusEnum(
                examId, studentId, EAttemptStatus.IN_PROGRESS.getValue())
                .orElseThrow(() -> new NotFoundException("No active exam attempt found"));

        attempt.setSubmittedAt(OffsetDateTime.now());
        attempt.setStatus(EAttemptStatus.COMPLETED);

        BigDecimal totalScore = BigDecimal.ZERO;

        Map<Integer, Question> questionMap = exam.getExamQuestions().stream()
                .map(ExamQuestion::getQuestion)
                .collect(Collectors.toMap(Question::getId, q -> q));

        Map<Integer, BigDecimal> pointsMap = exam.getExamQuestions().stream()
                .collect(Collectors.toMap(eq -> eq.getQuestion().getId(), ExamQuestion::getPoints));

        for (StudentAnswerDTO ans : request.getAnswers()) {
            Question question = questionMap.get(ans.getQuestionId());
            if (question == null)
                continue;

            boolean isCorrect = false;
            BigDecimal points = pointsMap.getOrDefault(question.getId(), BigDecimal.ZERO);

            if (question.getQuestionType() == EQuestionType.MULTIPLE_CHOICE) {
                if (ans.getSelectedAnswerId() != null) {
                    isCorrect = question.getMultipleChoiceAnswers().stream()
                            .anyMatch(a -> a.getId().equals(ans.getSelectedAnswerId())
                                    && Boolean.TRUE.equals(a.getIsCorrect()));
                }
            } else if (question.getQuestionType() == EQuestionType.FILL_BLANK) {
                if (ans.getTextAnswer() != null) {
                    String studentAns = ans.getTextAnswer().trim().toLowerCase();
                    isCorrect = question.getFillBlankAnswers().stream()
                            .anyMatch(a -> a.getNormalizedCorrectAnswer().equals(studentAns));
                }
            }

            if (isCorrect) {
                totalScore = totalScore.add(points);
            }
        }

        attempt.setTotalScore(totalScore);
        if (exam.getTotalPoints().compareTo(BigDecimal.ZERO) > 0) {
            attempt.setScorePercentage(totalScore.divide(exam.getTotalPoints(), 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)));
        } else {
            attempt.setScorePercentage(BigDecimal.ZERO);
        }

        attempt = examAttemptRepository.save(attempt);
        return BaseResponse.success(mapAttemptToDTO(attempt));
    }

    private ExamDTO mapToDTO(Exam exam) {
        return ExamDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .createdByTeacherId(exam.getCreatedByTeacher().getAccountId())
                .teacherName(exam.getCreatedByTeacher().getAccount() != null
                        ? exam.getCreatedByTeacher().getAccount().getFullName()
                        : null)
                .examMatrixId(exam.getExamMatrix() != null ? exam.getExamMatrix().getId() : null)
                .gradeLevel(exam.getGradeLevel())
                .description(exam.getDescription())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .durationMinutes(exam.getDurationMinutes())
                .maxAttempts(exam.getMaxAttempts())
                .scoringMethod(exam.getScoringMethod())
                .showResultsImmediately(exam.getShowResultsImmediately())
                .showCorrectAnswers(exam.getShowCorrectAnswers())
                .randomizeQuestions(exam.getRandomizeQuestions())
                .randomizeAnswers(exam.getRandomizeAnswers())
                .status(exam.getStatus())
                .totalQuestions(exam.getTotalQuestions())
                .totalPoints(exam.getTotalPoints())
                .passThreshold(exam.getPassThreshold())
                .createdAt(exam.getCreatedAt())
                .build();
    }

    private ExamAttemptDTO mapAttemptToDTO(ExamAttempt attempt) {
        return ExamAttemptDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExam().getId())
                .studentId(attempt.getStudent().getAccountId())
                .attemptNumber(attempt.getAttemptNumber())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .totalScore(attempt.getTotalScore())
                .scorePercentage(attempt.getScorePercentage())
                .status(attempt.getStatus())
                .build();
    }
}
