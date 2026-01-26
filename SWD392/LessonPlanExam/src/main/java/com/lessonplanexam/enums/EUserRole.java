package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EUserRole {
    ADMIN(1),
    TEACHER(2),
    STUDENT(3);

    private final int value;

    EUserRole(int value) {
        this.value = value;
    }

    public static EUserRole fromValue(int value) {
        for (EUserRole role : values()) {
            if (role.getValue() == value) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid EUserRole value: " + value);
    }
}
