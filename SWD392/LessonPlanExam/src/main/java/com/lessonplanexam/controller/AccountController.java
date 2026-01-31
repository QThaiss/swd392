package com.lessonplanexam.controller;

import com.lessonplanexam.dto.account.*;
import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        BaseResponse<LoginResponse> response = accountService.login(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/register-student")
    public ResponseEntity<BaseResponse<String>> registerStudent(@Valid @RequestBody RegisterRequest request) {
        BaseResponse<String> response = accountService.registerStudent(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @PostMapping("/register-teacher")
    public ResponseEntity<BaseResponse<String>> registerTeacher(@Valid @RequestBody RegisterRequest request) {
        BaseResponse<String> response = accountService.registerTeacher(request);
        return ResponseEntity.status(response.getStatusCode()).body(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<BaseResponse<AccountDTO>> getProfile() {
        BaseResponse<AccountDTO> response = accountService.getCurrentProfile();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<BaseResponse<AccountDTO>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        BaseResponse<AccountDTO> response = accountService.updateProfile(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<BaseResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        BaseResponse<String> response = accountService.changePassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-account")
    public ResponseEntity<BaseResponse<AccountDTO>> verifyAccount(@Valid @RequestBody VerifyAccountRequest request) {
        BaseResponse<AccountDTO> response = accountService.verifyAccount(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<String>> logout(@RequestBody LogoutRequest request) {
        // We can use request.getRefreshToken() if needed, but for now just clear
        // current context
        BaseResponse<String> response = accountService.logout(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<BaseResponse<LoginResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        BaseResponse<LoginResponse> response = accountService.refreshToken(request);
        return ResponseEntity.ok(response);
    }
}
