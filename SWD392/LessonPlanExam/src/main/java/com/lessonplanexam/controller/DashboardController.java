package com.lessonplanexam.controller;

import com.lessonplanexam.dto.dashboard.DashboardStatsResponse;
import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.service.AccountService;
import com.lessonplanexam.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AccountService accountService;

    @GetMapping("/teacher")
    public ResponseEntity<BaseResponse<DashboardStatsResponse>> getTeacherStats() {
        Integer teacherId = accountService.getCurrentUserId();
        // Ensure user is Teacher or Admin - logic handled in Service or PreAuthorize
        // usually,
        // but for now we just get stats for the current user assuming they are a
        // teacher
        DashboardStatsResponse stats = dashboardService.getTeacherStats(teacherId);
        return ResponseEntity.ok(BaseResponse.success("Teacher stats fetched successfully", stats));
    }

    @GetMapping("/student")
    public ResponseEntity<BaseResponse<DashboardStatsResponse>> getStudentStats() {
        Integer studentId = accountService.getCurrentUserId();
        DashboardStatsResponse stats = dashboardService.getStudentStats(studentId);
        return ResponseEntity.ok(BaseResponse.success("Student stats fetched successfully", stats));
    }

    @GetMapping("/admin")
    public ResponseEntity<BaseResponse<DashboardStatsResponse>> getAdminStats() {
        // In a real scenario, we should verify specific admin permission here or via
        // Security config
        DashboardStatsResponse stats = dashboardService.getAdminStats();
        return ResponseEntity.ok(BaseResponse.success("Admin stats fetched successfully", stats));
    }
}
