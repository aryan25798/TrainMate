package com.trainmate.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String loginId;
    private String name;
    private String role;
    private Long coachId;
    private Long trainerId;

    public LoginResponse() {}

    public LoginResponse(boolean success, String message, Long userId, String loginId, String name, String role, Long coachId, Long trainerId) {
        this.success = success;
        this.message = message;
        this.userId = userId;
        this.loginId = loginId;
        this.name = name;
        this.role = role;
        this.coachId = coachId;
        this.trainerId = trainerId;
    }

    public static LoginResponse failure(String message) {
        LoginResponse resp = new LoginResponse();
        resp.setSuccess(false);
        resp.setMessage(message);
        return resp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getCoachId() {
        return coachId;
    }

    public void setCoachId(Long coachId) {
        this.coachId = coachId;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }
}
