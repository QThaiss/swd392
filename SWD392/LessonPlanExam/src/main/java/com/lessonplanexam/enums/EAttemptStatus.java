package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EAttemptStatus {
    IN_PROGRESS(1),
    SUBMITTED(2),
    COMPLETED(2), // Alias for SUBMITTED if that's the intention, or separate? Let's Assume
                  // COMPLETED = 2 for now, as SUBMITTED implies done.
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
