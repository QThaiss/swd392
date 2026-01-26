package com.lessonplanexam.dto.common;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaseResponse<T> {
    private int statusCode;
    private String message;
    private T data;
    private boolean success;

    public static <T> BaseResponse<T> success(T data) {
        return BaseResponse.<T>builder()
                .statusCode(200)
                .message("Success")
                .data(data)
                .success(true)
                .build();
    }

    public static <T> BaseResponse<T> success(String message, T data) {
        return BaseResponse.<T>builder()
                .statusCode(200)
                .message(message)
                .data(data)
                .success(true)
                .build();
    }

    public static <T> BaseResponse<T> created(T data) {
        return BaseResponse.<T>builder()
                .statusCode(201)
                .message("Created successfully")
                .data(data)
                .success(true)
                .build();
    }

    public static <T> BaseResponse<T> error(int statusCode, String message) {
        return BaseResponse.<T>builder()
                .statusCode(statusCode)
                .message(message)
                .data(null)
                .success(false)
                .build();
    }

    public static <T> BaseResponse<T> badRequest(String message) {
        return error(400, message);
    }

    public static <T> BaseResponse<T> unauthorized(String message) {
        return error(401, message);
    }

    public static <T> BaseResponse<T> forbidden(String message) {
        return error(403, message);
    }

    public static <T> BaseResponse<T> notFound(String message) {
        return error(404, message);
    }
}
