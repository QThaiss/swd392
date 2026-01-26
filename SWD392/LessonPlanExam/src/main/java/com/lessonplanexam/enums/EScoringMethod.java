package com.lessonplanexam.enums;

import lombok.Getter;

@Getter
public enum EScoringMethod {
    AVERAGE(1),
    HIGHEST(2),
    LATEST(3);

    private final int value;

    EScoringMethod(int value) {
        this.value = value;
    }

    public static EScoringMethod fromValue(int value) {
        for (EScoringMethod method : values()) {
            if (method.getValue() == value) {
                return method;
            }
        }
        throw new IllegalArgumentException("Invalid EScoringMethod value: " + value);
    }
}
