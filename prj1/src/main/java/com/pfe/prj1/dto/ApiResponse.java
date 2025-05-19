package com.pfe.prj1.dto;

import lombok.Data;

@Data
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Integer status;
    private Long timestamp = System.currentTimeMillis();

    public ApiResponse(String message) {
        this.message = message;
        this.success = message.startsWith("Erreur") ? false : true;
    }

    public ApiResponse(String message, T data) {
        this.message = message;
        this.data = data;
        this.success = true;
    }

    // Fluent setters
    public ApiResponse<T> setSuccess(boolean success) {
        this.success = success;
        return this;
    }

    public ApiResponse<T> setStatus(Integer status) {
        this.status = status;
        return this;
    }
}