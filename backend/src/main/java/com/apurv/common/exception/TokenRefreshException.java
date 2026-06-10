package com.apurv.common.exception;

public class TokenRefreshException extends RuntimeException {

    public TokenRefreshException(String token, String message) {
        super(message);
    }
}
