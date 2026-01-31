package com.lessonplanexam.dto.account;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}
