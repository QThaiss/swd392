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

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public BaseResponse<LoginResponse> login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        Account account = accountRepository.findByNormalizedEmail(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new BadRequestException("Invalid email or password");
        }
        if (account.getIsActive() == null || !account.getIsActive()) {
            throw new BadRequestException("Account is inactive");
        }

        String role = account.getRole().name();
        String accessToken = jwtTokenProvider.generateAccessToken(account.getId(), account.getEmail(), role);
        String refreshToken = jwtTokenProvider.generateRefreshToken(account.getId());

        return BaseResponse.success("Login successful", LoginResponse.builder()
                .accessToken(accessToken).refreshToken(refreshToken).tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationTime()).user(mapToDTO(account)).build());
    }

    @Transactional
    public BaseResponse<AccountDTO> registerStudent(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (accountRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail()).normalizedEmail(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName()).phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true).emailVerified(false).build();
        account.setRole(EUserRole.STUDENT);
        account = accountRepository.saveAndFlush(account);

        Student student = Student.builder().account(account).isActive(true).build();
        studentRepository.save(student);

        return BaseResponse.created(mapToDTO(account));
    }

    @Transactional
    public BaseResponse<AccountDTO> registerTeacher(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (accountRepository.existsByNormalizedEmail(normalizedEmail)) {
            throw new BadRequestException("Email already exists");
        }

        Account account = Account.builder()
                .email(request.getEmail()).normalizedEmail(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName()).phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .isActive(true).emailVerified(false).build();
        account.setRole(EUserRole.TEACHER);
        account = accountRepository.saveAndFlush(account);

        Teacher teacher = Teacher.builder().account(account).schoolName(request.getSchoolName()).isActive(true).build();
        teacherRepository.save(teacher);

        AccountDTO dto = mapToDTO(account);
        dto.setSchoolName(request.getSchoolName());
        return BaseResponse.created(dto);
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
        account = accountRepository.save(account);
        return BaseResponse.success("Account status updated", mapToDTO(account));
    }

    private AccountDTO mapToDTO(Account account) {
        return AccountDTO.builder().id(account.getId()).email(account.getEmail()).role(account.getRole())
                .fullName(account.getFullName()).phone(account.getPhone()).dateOfBirth(account.getDateOfBirth())
                .avatarUrl(account.getAvatarUrl()).isActive(account.getIsActive())
                .emailVerified(account.getEmailVerified()).createdAt(account.getCreatedAt()).build();
    }
}
