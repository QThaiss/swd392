package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EQuestionBankStatus {
    DRAFT(1),
    ACTIVE(2),
    ARCHIVED(3);

    private final int value;

    EQuestionBankStatus(int value) {
        this.value = value;
    }

    public static EQuestionBankStatus fromValue(int value) {
        for (EQuestionBankStatus status : values()) {
            if (status.getValue() == value) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid EQuestionBankStatus value: " + value);
    }
}
