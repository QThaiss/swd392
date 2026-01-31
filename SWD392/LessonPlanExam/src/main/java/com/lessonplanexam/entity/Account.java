package com.lessonplanexam.entity;

import com.lessonplanexam.enums.EUserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "normalized_email", nullable = false, unique = true)
    private String normalizedEmail;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "role_enum", nullable = false)
    private Integer roleEnum;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String phone;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "lock_time")
    private OffsetDateTime lockTime;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiration")
    private OffsetDateTime otpExpiration;

    @Column(name = "current_refresh_token")
    private String currentRefreshToken;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private Admin admin;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private Teacher teacher;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    private Student student;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @Transient
    public EUserRole getRole() {
        return EUserRole.fromValue(this.roleEnum);
    }

    public void setRole(EUserRole role) {
        this.roleEnum = role.getValue();
    }
}
