package com.lessonplanexam.service;

import com.lessonplanexam.dto.dashboard.DashboardStatsResponse;
import com.lessonplanexam.repository.AccountRepository;
import com.lessonplanexam.repository.ExamAttemptRepository;
import com.lessonplanexam.repository.ExamRepository;
import com.lessonplanexam.repository.LessonPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExamRepository examRepository;
    private final LessonPlanRepository lessonPlanRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final AccountRepository accountRepository; // For student counting if we had a dedicated connection table

    public DashboardStatsResponse getTeacherStats(Integer teacherId) {
        long totalExams = examRepository.countByTeacherId(teacherId);
        long totalLessonPlans = lessonPlanRepository.countByTeacherId(teacherId);

        // For now, total students can be placeholder or a global count if teachers
        // share students.
        // Or if we had a Class/Enrollment logic, we would query that.
        // Let's assume a static calculation or global student count for now as
        // requested by user plan assumptions.
        long totalStudents = accountRepository.count(); // This is ALL accounts, simplistic.
        // Better: hardcode or just leaving it as is for now until Enrollment feature
        // exists.
        // Let's use a meaningful placeholder logic:
        long estimatedStudents = 150;

        Double avgScore = examAttemptRepository.findAverageScoreByTeacherId(teacherId);

        return DashboardStatsResponse.builder()
                .totalExams(totalExams)
                .totalLessonPlans(totalLessonPlans)
                .totalStudents(estimatedStudents) // Placeholder until Enrollment feature
                .averageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .build();
    }

    public DashboardStatsResponse getStudentStats(Integer studentId) {
        // Pending exams = Active Exams (Total) - Completed Exams (By Student)
        long totalActiveExams = examRepository.countByStatus(com.lessonplanexam.enums.EExamStatus.ACTIVE.getValue());

        long completedExams = examAttemptRepository.countCompletedByStudentId(studentId);
        long pendingExams = Math.max(0, totalActiveExams - completedExams);

        Double avgScore = examAttemptRepository.findAverageScoreByStudentId(studentId);

        return DashboardStatsResponse.builder()
                .completedExams(completedExams)
                .pendingExams(pendingExams)
                .studentAverageScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .achievements(5) // Placeholder for achievement system
                .build();
    }

    public DashboardStatsResponse getAdminStats() {
        long totalUsers = accountRepository.count();
        long totalTeachers = accountRepository.countByRoleEnum(com.lessonplanexam.enums.EUserRole.TEACHER.getValue());
        long totalStudents = accountRepository.countByRoleEnum(com.lessonplanexam.enums.EUserRole.STUDENT.getValue());
        long totalExams = examRepository.count();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalTeachers(totalTeachers)
                .totalStudents(totalStudents)
                .totalExams(totalExams)
                .build();
    }
}
