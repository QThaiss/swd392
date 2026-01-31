package com.lessonplanexam.service;

import com.lessonplanexam.dto.account.*;
import com.lessonplanexam.dto.common.BaseResponse;
import com.lessonplanexam.entity.*;
import com.lessonplanexam.enums.EUserRole;
import com.lessonplanexam.exception.*;
import com.lessonplanexam.repository.*;
import com.lessonplanexam.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    public BaseResponse<LoginResponse> login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Account account = accountRepository.findByNormalizedEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // Check Lockout
        if (account.getLockTime() != null && account.getLockTime().isAfter(OffsetDateTime.now())) {
            throw new BadRequestException(
                    "Account temporarily locked due to multiple failed attempts. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            // Increment Failed Attempts
            int attempts = (account.getFailedLoginAttempts() == null ? 0 : account.getFailedLoginAttempts()) + 1;
            account.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                account.setLockTime(OffsetDateTime.now().plusMinutes(15));
                account.setFailedLoginAttempts(0); // Optional: Reset or keep until lock expires
            }
            accountRepository.save(account);
            throw new BadRequestException("Invalid email or password");
        }

        // Reset failures on success
        if (account.getFailedLoginAttempts() != null && account.getFailedLoginAttempts() > 0) {
            account.setFailedLoginAttempts(0);
            account.setLockTime(null);
        }

        if (account.getIsActive() == null || !account.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }

        if (Boolean.FALSE.equals(account.getEmailVerified())) {
            throw new BadRequestException("Email not verified. Please verify your account.");
        }

        String role = account.getRole().name();
        String accessToken = jwtTokenProvider.generateAccessToken(account.getId(), account.getEmail(), role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(account.getId());

        // Store Refresh Token
        account.setCurrentRefreshToken(refreshToken);
        accountRepository.save(account);

        return BaseResponse.success("Login successful", LoginResponse.builder()
                .accessToken(accessToken).refreshToken(refreshToken).tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime()).user(mapToDTO(account)).build());
    }

    @Transactional
    public BaseResponse<String> registerStudent(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (accountRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail()).normalizedEmail(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName()).phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true).emailVerified(false) // Initially false
                .build();
        account.setRole(EUserRole.STUDENT);

        // OTP Generation
        String otp = String.format("%06d", new Random().nextInt(999999));
        account.setOtpCode(otp);
        account.setOtpExpiration(OffsetDateTime.now().plusMinutes(10));

        account = accountRepository.saveAndFlush(account);

        Student student = Student.builder().account(account).isActive(true).build();
        studentRepository.save(student);

        // Send Email
        emailService.sendOtpEmail(account.getEmail(), otp);

        return BaseResponse.created("Registration successful. Please verify your email.");
    }

    @Transactional
    public BaseResponse<String> registerTeacher(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (accountRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail()).normalizedEmail(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName()).phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true).emailVerified(false) // Initially false
                .build();
        account.setRole(EUserRole.TEACHER);

        // OTP Generation
        String otp = String.format("%06d", new Random().nextInt(999999));
        account.setOtpCode(otp);
        account.setOtpExpiration(OffsetDateTime.now().plusMinutes(10));

        account = accountRepository.saveAndFlush(account);

        Teacher teacher = Teacher.builder().account(account).schoolName(request.getSchoolName()).isActive(true).build();
        teacherRepository.save(teacher);

        // Send Email
        emailService.sendOtpEmail(account.getEmail(), otp);

        return BaseResponse.created("Registration successful. Please verify your email.");
    }

    @Transactional
    public BaseResponse<AccountDTO> verifyAccount(VerifyAccountRequest request) {
        Account account = accountRepository.findByNormalizedEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (Boolean.TRUE.equals(account.getEmailVerified())) {
            return BaseResponse.success("Account already verified", mapToDTO(account));
        }

        if (account.getOtpCode() == null || !account.getOtpCode().equals(request.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        if (account.getOtpExpiration() != null && account.getOtpExpiration().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }

        account.setEmailVerified(true);
        account.setOtpCode(null);
        account.setOtpExpiration(null);
        account = accountRepository.save(account);

        return BaseResponse.success("Account verified successfully", mapToDTO(account));
    }

    @Transactional
    public BaseResponse<String> logout(LogoutRequest request) {
        // Standard logout implies dealing with the current user or specific token
        // Here we clear the current refresh token to invalidate it
        Integer userId = getCurrentUserId();
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        account.setCurrentRefreshToken(null);
        accountRepository.save(account);

        return BaseResponse.success("Logged out successfully");
    }

    public BaseResponse<AccountDTO> getCurrentProfile() {
        Integer userId = getCurrentUserId();
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        AccountDTO dto = mapToDTO(account);
        if (account.getTeacher() != null) {
            dto.setSchoolName(account.getTeacher().getSchoolName());
        }
        return BaseResponse.success(dto);
    }

    public Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }
        if (auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getUserId();
        }
        throw new UnauthorizedException("Invalid authentication");
    }

    public String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }
        if (auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getRole();
        }
        throw new UnauthorizedException("Invalid authentication");
    }

    public boolean isCurrentUserAdmin() {
        return EUserRole.ADMIN.name().equals(getCurrentUserRole());
    }

    @Transactional
    public BaseResponse<String> changePassword(ChangePasswordRequest request) {
        Integer userId = getCurrentUserId();
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Invalid current password");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        return BaseResponse.success("Password changed successfully");
    }

    @Transactional
    public BaseResponse<AccountDTO> updateProfile(UpdateProfileRequest request) {
        Integer userId = getCurrentUserId();
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        account.setFullName(request.getFullName());
        account.setPhone(request.getPhone());
        account.setDateOfBirth(request.getDateOfBirth());
        account.setAvatarUrl(request.getAvatarUrl());

        if (account.getRole() == EUserRole.TEACHER && request.getSchoolName() != null) {
            Teacher teacher = account.getTeacher();
            if (teacher != null) {
                teacher.setSchoolName(request.getSchoolName());
                teacherRepository.save(teacher);
            }
        }

        account = accountRepository.save(account);
        AccountDTO dto = mapToDTO(account);
        if (account.getTeacher() != null) {
            dto.setSchoolName(account.getTeacher().getSchoolName());
        }

        return BaseResponse.success("Profile updated successfully", dto);
    }

    public BaseResponse<com.lessonplanexam.dto.common.PageResponse<AccountDTO>> getAllAccounts(
            org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<Account> page = accountRepository.findAll(pageable);
        org.springframework.data.domain.Page<AccountDTO> dtoPage = page.map(this::mapToDTO);
        return BaseResponse.success(com.lessonplanexam.dto.common.PageResponse.from(dtoPage));
    }

    @Transactional
    public BaseResponse<AccountDTO> toggleAccountStatus(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        // Prevent deactivating own account if needed, but for now allow admin to do
        // anything

        account.setIsActive(!account.getIsActive());

        // If account is being deactivated, revoke refresh token to prevent session
        // renewal
        if (Boolean.FALSE.equals(account.getIsActive())) {
            account.setCurrentRefreshToken(null);
        }

        account = accountRepository.save(account);
        return BaseResponse.success("Account status updated", mapToDTO(account));
    }

    @Transactional
    public BaseResponse<AccountDTO> createTeacherByAdmin(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (accountRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail()).normalizedEmail(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName()).phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true).emailVerified(true) // Auto-verified
                .build();
        account.setRole(EUserRole.TEACHER);

        account = accountRepository.saveAndFlush(account);

        Teacher teacher = Teacher.builder().account(account).schoolName(request.getSchoolName()).isActive(true).build();
        teacherRepository.save(teacher);

        return BaseResponse.created(mapToDTO(account));
    }

    @Transactional
    public BaseResponse<LoginResponse> refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(token)) {
            throw new BadRequestException("Invalid refresh token");
        }

        Integer userId = jwtTokenProvider.getUserIdFromToken(token);
        Account account = accountRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        // Check if token matches stored token (Revocation check)
        if (account.getCurrentRefreshToken() == null || !account.getCurrentRefreshToken().equals(token)) {
            throw new BadRequestException("Invalid or revoked refresh token");
        }

        // Generate new pair
        String newAccessToken = jwtTokenProvider.generateAccessToken(account.getId(), account.getEmail(),
                account.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(account.getId());

        // Rotate Refresh Token
        account.setCurrentRefreshToken(newRefreshToken);
        accountRepository.save(account);

        return BaseResponse.success("Token refreshed", LoginResponse.builder()
                .accessToken(newAccessToken).refreshToken(newRefreshToken).tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime()).user(mapToDTO(account)).build());
    }

    private AccountDTO mapToDTO(Account account) {
        return AccountDTO.builder().id(account.getId()).email(account.getEmail()).role(account.getRole())
                .fullName(account.getFullName()).phone(account.getPhone()).dateOfBirth(account.getDateOfBirth())
                .avatarUrl(account.getAvatarUrl()).isActive(account.getIsActive())
                .emailVerified(account.getEmailVerified()).createdAt(account.getCreatedAt()).build();
    }
}
