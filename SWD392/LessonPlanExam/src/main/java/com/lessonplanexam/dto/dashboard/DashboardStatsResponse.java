package com.lessonplanexam.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {
    // Teacher Stats
    private Long totalExams;
    private Long totalLessonPlans;
    private Long totalStudents; // For now, total active students in system or linked to teacher
    private Double averageScore; // Across all their exams

    // Student Stats
    private Long completedExams;
    private Long pendingExams;
    private Double studentAverageScore;
    private Integer achievements;

    // Admin Stats
    private Long totalUsers;
    private Long totalTeachers;
    // totalStudents is already defined above
    // totalExams is already defined above
}
