package com.lessonplanexam.service.impl;

import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.dto.exam.*;
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
import java.util.Optional;
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
    private final AccountRepository accountRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final StudentRepository studentRepository;
    private final ExamQuestionRepository examQuestionRepository;

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
        Integer userId = accountService.getCurrentUserId();

        // Get or create student profile
        Student student = studentRepository.findById(userId).orElse(null);
        if (student == null) {
            // Auto-create student profile for any authenticated user
            Account account = accountRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("Account not found"));
            student = Student.builder()
                    .account(account)
                    .isActive(true)
                    .build();
            student = studentRepository.save(student);
        }

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (exam.getStatus() != EExamStatus.ACTIVE) {
            throw new ForbiddenException("Exam is not active");
        }

        // Check for existing in-progress attempt first
        Optional<ExamAttempt> inProgressAttempt = examAttemptRepository.findByExamIdAndStudentIdAndStatusEnum(
                examId, userId, EAttemptStatus.IN_PROGRESS.getValue());

        if (inProgressAttempt.isPresent()) {
            // Return existing in-progress attempt
            return BaseResponse.success("Resuming existing attempt", mapAttemptToDTO(inProgressAttempt.get()));
        }

        // Get all attempts for this exam by this student
        List<ExamAttempt> allAttempts = examAttemptRepository.findByExamIdAndStudentId(examId, userId);

        // DEBUG: Log existing attempts
        System.out.println("=== START EXAM DEBUG ===");
        System.out.println("ExamId: " + examId + ", UserId: " + userId);
        System.out.println("Total attempts found: " + allAttempts.size());
        for (ExamAttempt a : allAttempts) {
            System.out.println("  - Attempt #" + a.getAttemptNumber() + " status=" + a.getStatusEnum());
        }

        // Check if max attempts reached
        long completedAttempts = allAttempts.stream()
                .filter(a -> a.getStatus() != EAttemptStatus.IN_PROGRESS)
                .count();

        if (completedAttempts >= exam.getMaxAttempts()) {
            throw new ForbiddenException("Max attempts reached. You have completed " + completedAttempts + "/"
                    + exam.getMaxAttempts() + " attempts.");
        }

        // Calculate next attempt number (max existing + 1)
        int nextAttemptNumber = allAttempts.stream()
                .mapToInt(a -> a.getAttemptNumber() != null ? a.getAttemptNumber() : 0)
                .max()
                .orElse(0) + 1;

        System.out.println("Next attempt number calculated: " + nextAttemptNumber);
        System.out.println("=== END DEBUG ===");

        ExamAttempt attempt = ExamAttempt.builder()
                .exam(exam)
                .student(student)
                .attemptNumber(nextAttemptNumber)
                .startedAt(OffsetDateTime.now())
                .statusEnum(EAttemptStatus.IN_PROGRESS.getValue())
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
        int correctCount = 0;

        Map<Integer, Question> questionMap = exam.getExamQuestions().stream()
                .map(ExamQuestion::getQuestion)
                .collect(Collectors.toMap(Question::getId, q -> q));

        Map<Integer, BigDecimal> pointsMap = exam.getExamQuestions().stream()
                .collect(Collectors.toMap(eq -> eq.getQuestion().getId(), ExamQuestion::getPoints));

        List<StudentAnswerDTO> answers = request.getAnswers() != null ? request.getAnswers() : new ArrayList<>();

        for (StudentAnswerDTO ans : answers) {
            // Fetch fresh question from repository to ensure latest data and correct lazy
            // loading context
            Question question = questionRepository.findById(ans.getQuestionId()).orElse(null);

            if (question == null) {
                System.out.println("DEBUG: Question not found in DB for ID: " + ans.getQuestionId());
                continue;
            }

            // Force load lazy collections
            if (question.getMultipleChoiceAnswers() != null)
                question.getMultipleChoiceAnswers().size();
            if (question.getFillBlankAnswers() != null)
                question.getFillBlankAnswers().size();

            boolean isCorrect = false;
            // Get points from the exam-question relation if possible, or default
            BigDecimal points = pointsMap.getOrDefault(question.getId(), BigDecimal.ZERO);

            System.out.println("DEBUG: Checking Q: " + question.getId() + ", Type: " + question.getQuestionType());
            System.out
                    .println("DEBUG: Student Ans ID: " + ans.getSelectedAnswerId() + ", Text: " + ans.getTextAnswer());

            if (question.getQuestionType() == EQuestionType.MULTIPLE_CHOICE) {
                if (ans.getSelectedAnswerId() != null) {
                    // Debug answers
                    if (question.getMultipleChoiceAnswers() != null) {
                        for (var a : question.getMultipleChoiceAnswers()) {
                            if (Boolean.TRUE.equals(a.getIsCorrect())) {
                                System.out.println(
                                        "DEBUG: Correct Ans ID: " + a.getId() + " (" + a.getAnswerText() + ")");
                            }
                        }
                    } else {
                        System.out.println("DEBUG: MultipleChoiceAnswers is NULL or Empty!");
                    }

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

            System.out.println("DEBUG: isCorrect: " + isCorrect);

            if (isCorrect) {
                totalScore = totalScore.add(points);
                correctCount++;
            }
        }

        int totalQuestions = exam.getExamQuestions().size();
        int incorrectCount = totalQuestions - correctCount;

        attempt.setTotalScore(totalScore);
        attempt.setMaxScore(exam.getTotalPoints() != null ? exam.getTotalPoints() : BigDecimal.ZERO);
        attempt.setCorrectCount(correctCount);
        attempt.setTotalQuestions(totalQuestions);
        BigDecimal examTotalPoints = exam.getTotalPoints() != null ? exam.getTotalPoints() : BigDecimal.ZERO;
        if (examTotalPoints.compareTo(BigDecimal.ZERO) > 0) {
            attempt.setScorePercentage(totalScore.divide(examTotalPoints, 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)));
        } else {
            attempt.setScorePercentage(BigDecimal.ZERO);
        }

        attempt = examAttemptRepository.save(attempt);

        // Build DTO with counts
        return BaseResponse.success(ExamAttemptDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExam().getId())
                .studentId(attempt.getStudent().getAccountId())
                .attemptNumber(attempt.getAttemptNumber())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getMaxScore())
                .scorePercentage(attempt.getScorePercentage())
                .status(attempt.getStatus())
                .correctCount(correctCount)
                .incorrectCount(incorrectCount)
                .totalQuestions(totalQuestions)
                .build());
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
        Integer totalQ = attempt.getTotalQuestions() != null ? attempt.getTotalQuestions() : 0;
        Integer correctC = attempt.getCorrectCount() != null ? attempt.getCorrectCount() : 0;
        Integer incorrectC = totalQ - correctC;

        return ExamAttemptDTO.builder()
                .id(attempt.getId())
                .examId(attempt.getExam().getId())
                .studentId(attempt.getStudent().getAccountId())
                .attemptNumber(attempt.getAttemptNumber())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .totalScore(attempt.getTotalScore())
                .maxScore(attempt.getMaxScore())
                .scorePercentage(attempt.getScorePercentage())
                .status(attempt.getStatus())
                .correctCount(correctC)
                .incorrectCount(incorrectC)
                .totalQuestions(totalQ)
                .build();
    }

    @Override
    public BaseResponse<java.util.List<ExamAttemptDTO>> getMyAttempts(Integer examId) {
        Integer userId = accountService.getCurrentUserId();

        List<ExamAttempt> attempts = examAttemptRepository.findByExamIdAndStudentId(examId, userId);

        List<ExamAttemptDTO> attemptDTOs = attempts.stream()
                .map(this::mapAttemptToDTO)
                .collect(Collectors.toList());

        return BaseResponse.success(attemptDTOs);
    }

    // ==================== NEW METHODS ====================

    @Override
    @Transactional
    public BaseResponse<ExamQuestionsResponse> addQuestionsToExam(Integer examId, AddQuestionsToExamRequest request) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only modify your own exams");
        }

        Integer currentMaxOrder = examQuestionRepository.findMaxOrderIndexByExamId(examId);
        int orderIndex = currentMaxOrder != null ? currentMaxOrder + 1 : 0;

        for (AddQuestionsToExamRequest.QuestionWithPoints qwp : request.getQuestions()) {
            // Check if question already exists in exam
            if (examQuestionRepository.findByExamIdAndQuestionId(examId, qwp.getQuestionId()).isPresent()) {
                continue; // Skip duplicates
            }

            Question question = questionRepository.findById(qwp.getQuestionId())
                    .orElseThrow(() -> new NotFoundException("Question not found: " + qwp.getQuestionId()));

            ExamQuestion examQuestion = ExamQuestion.builder()
                    .exam(exam)
                    .question(question)
                    .orderIndex(orderIndex++)
                    .points(qwp.getPoints() != null ? qwp.getPoints() : BigDecimal.ONE)
                    .build();
            examQuestionRepository.save(examQuestion);
        }

        // Update exam totals
        updateExamTotals(exam);

        return BaseResponse.success("Questions added successfully", getExamQuestionsResponse(exam));
    }

    @Override
    public BaseResponse<ExamQuestionsResponse> getExamQuestions(Integer examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        return BaseResponse.success(getExamQuestionsResponse(exam));
    }

    @Override
    @Transactional
    public BaseResponse<?> removeQuestionFromExam(Integer examId, Integer questionId) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only modify your own exams");
        }

        ExamQuestion examQuestion = examQuestionRepository.findByExamIdAndQuestionId(examId, questionId)
                .orElseThrow(() -> new NotFoundException("Question not found in exam"));

        examQuestionRepository.delete(examQuestion);

        // Update exam totals
        updateExamTotals(exam);

        return BaseResponse.success("Question removed successfully", null);
    }

    @Override
    @Transactional
    public BaseResponse<ExamDTO> publish(Integer examId) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only publish your own exams");
        }

        exam.setStatus(EExamStatus.ACTIVE);
        exam = examRepository.save(exam);

        return BaseResponse.success("Exam published successfully", mapToDTO(exam));
    }

    @Override
    @Transactional
    public BaseResponse<ExamDTO> saveToDraft(Integer examId) {
        Integer teacherId = accountService.getCurrentUserId();
        boolean isAdmin = accountService.isCurrentUserAdmin();

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new NotFoundException("Exam not found"));

        if (!isAdmin && !exam.getCreatedByTeacher().getAccountId().equals(teacherId)) {
            throw new ForbiddenException("You can only modify your own exams");
        }

        exam.setStatus(EExamStatus.DRAFT);
        exam = examRepository.save(exam);

        return BaseResponse.success("Exam saved as draft", mapToDTO(exam));
    }

    @Override
    @Transactional
    public BaseResponse<ExamDTO> createFromMatrix(CreateExamFromMatrixRequest request) {
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
                throw new ForbiddenException("Only teachers can create exams");
            }
        }

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .createdByTeacher(teacher)
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
        if (request.getScoringMethod() != null) {
            exam.setScoringMethod(request.getScoringMethod());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            exam.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        // Handle matrix-based question generation
        List<ExamQuestion> generatedQuestions = new ArrayList<>();
        int orderIndex = 0;

        if (request.getMatrixId() != null) {
            // Use existing matrix
            ExamMatrix matrix = examMatrixRepository.findById(request.getMatrixId())
                    .orElseThrow(() -> new NotFoundException("Exam matrix not found"));
            exam.setExamMatrix(matrix);

            for (ExamMatrixItem item : matrix.getMatrixItems()) {
                List<Question> randomQuestions = questionRepository.findRandomQuestionsByBankAndDifficulty(
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
        } else if (request.getMatrixItems() != null && !request.getMatrixItems().isEmpty()) {
            // Use inline matrix items

            // Get top-level questionBankId as fallback
            Integer defaultQuestionBankId = request.getQuestionBankId();

            for (com.lessonplanexam.dto.exammatrix.CreateExamMatrixRequest.MatrixItemRequest item : request
                    .getMatrixItems()) {

                // Use item-level questionBankId, or fall back to top-level
                Integer bankId = item.getQuestionBankId() != null
                        ? item.getQuestionBankId()
                        : defaultQuestionBankId;

                if (bankId == null) {
                    throw new IllegalArgumentException("Question bank ID is required");
                }

                Integer diffLevel = item.getEffectiveDifficultyLevel();

                List<Question> randomQuestions = questionRepository.findRandomQuestionsByBankAndDifficulty(
                        bankId,
                        diffLevel,
                        item.getQuestionCount());

                for (Question q : randomQuestions) {
                    generatedQuestions.add(ExamQuestion.builder()
                            .exam(exam)
                            .question(q)
                            .orderIndex(orderIndex++)
                            .points(item.getPointsPerQuestion() != null ? item.getPointsPerQuestion() : BigDecimal.ONE)
                            .build());
                }
            }
        }

        exam.setExamQuestions(generatedQuestions);
        exam.setTotalQuestions(generatedQuestions.size());
        exam.setTotalPoints(generatedQuestions.stream()
                .map(ExamQuestion::getPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        exam = examRepository.save(exam);
        return BaseResponse.created(mapToDTO(exam));
    }

    // Helper methods
    private void updateExamTotals(Exam exam) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByOrderIndex(exam.getId());
        exam.setTotalQuestions(examQuestions.size());
        exam.setTotalPoints(examQuestions.stream()
                .map(ExamQuestion::getPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        examRepository.save(exam);
    }

    private ExamQuestionsResponse getExamQuestionsResponse(Exam exam) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findByExamIdOrderByOrderIndex(exam.getId());

        List<ExamQuestionsResponse.ExamQuestionDTO> questionDTOs = examQuestions.stream()
                .map(eq -> ExamQuestionsResponse.ExamQuestionDTO.builder()
                        .id(eq.getId())
                        .orderIndex(eq.getOrderIndex())
                        .points(eq.getPoints())
                        .question(mapQuestionToDTO(eq.getQuestion()))
                        .build())
                .collect(Collectors.toList());

        return ExamQuestionsResponse.builder()
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .totalQuestions(questionDTOs.size())
                .questions(questionDTOs)
                .build();
    }

    private com.lessonplanexam.dto.question.QuestionDTO mapQuestionToDTO(Question question) {
        List<com.lessonplanexam.dto.question.AnswerDTO> answerDTOs = new ArrayList<>();

        if (question.getQuestionType() == EQuestionType.MULTIPLE_CHOICE) {
            answerDTOs = question.getMultipleChoiceAnswers().stream()
                    .map(a -> com.lessonplanexam.dto.question.AnswerDTO.builder()
                            .id(a.getId())
                            .answerText(a.getAnswerText())
                            .isCorrect(a.getIsCorrect())
                            .explanation(a.getExplanation())
                            .orderIndex(a.getOrderIndex())
                            .build())
                    .collect(Collectors.toList());
        } else if (question.getQuestionType() == EQuestionType.FILL_BLANK) {
            answerDTOs = question.getFillBlankAnswers().stream()
                    .map(a -> com.lessonplanexam.dto.question.AnswerDTO.builder()
                            .id(a.getId())
                            .answerText(a.getCorrectAnswer())
                            .explanation(a.getExplanation())
                            .build())
                    .collect(Collectors.toList());
        }

        return com.lessonplanexam.dto.question.QuestionDTO.builder()
                .id(question.getId())
                .questionBankId(question.getQuestionBank().getId())
                .questionDifficultyId(question.getQuestionDifficulty() != null
                        ? question.getQuestionDifficulty().getId()
                        : null)
                .difficultyLevel(question.getQuestionDifficulty() != null
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
