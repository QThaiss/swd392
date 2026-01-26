package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EAttemptStatus {
    IN_PROGRESS(1),
    SUBMITTED(2),
    GRADED(3),
    EXPIRED(4);

    private final int value;

    EAttemptStatus(int value) {
        this.value = value;
    }

    public static EAttemptStatus fromValue(int value) {
        for (EAttemptStatus status : values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid EAttemptStatus value: " + value);
    }
}
