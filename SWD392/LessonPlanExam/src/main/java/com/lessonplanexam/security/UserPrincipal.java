package com.lessonplanexam.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserPrincipal {
    private Integer userId;
    private String email;
    private String role;
}
