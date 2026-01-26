package com.lessonplanexam.dto.account;

import com.lessonplanexam.enums.EUserRole;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDTO {
    private Integer id;
    private String email;
    private EUserRole role;
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean emailVerified;
    private OffsetDateTime createdAt;

    // For Teacher
    private String schoolName;
}
