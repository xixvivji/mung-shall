package com.example.backend.security.oauth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    private static final String DEFAULT_REDIRECT_URL = "http://localhost:3000/oauth/callback";

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        org.springframework.security.core.AuthenticationException exception)
            throws IOException, ServletException {

        String msg = exception.getMessage();
        String encoded = URLEncoder.encode(msg, StandardCharsets.UTF_8);

        response.sendRedirect(DEFAULT_REDIRECT_URL + "?error=OAUTH2_FAILED&message=" + encoded);
    }
}
