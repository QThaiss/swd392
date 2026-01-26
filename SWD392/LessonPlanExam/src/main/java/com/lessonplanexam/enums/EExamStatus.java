package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EExamStatus {
    DRAFT(1),
    INACTIVE(2),
    ACTIVE(3);

    private final int value;

    EExamStatus(int value) {
        this.value = value;
    }

    public static EExamStatus fromValue(int value) {
        for (EExamStatus status : values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid EExamStatus value: " + value);
    }
}
