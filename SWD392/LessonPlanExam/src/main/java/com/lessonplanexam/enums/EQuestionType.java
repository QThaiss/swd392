package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EQuestionType {
    MULTIPLE_CHOICE(1),
    FILL_BLANK(2);

    private final int value;

    EQuestionType(int value) {
        this.value = value;
    }

    public static EQuestionType fromValue(int value) {
        for (EQuestionType type : values()) {
            if (type.getValue() == value) {
                return type;
            }
        }
        throw new IllegalArgumentException("Invalid EQuestionType value: " + value);
    }
}
