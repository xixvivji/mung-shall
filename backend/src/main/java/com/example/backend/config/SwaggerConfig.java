package com.example.backend.config;

import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        String jwtSchemeName = "BearerAuth";

        return new OpenAPI()
                .servers(List.of(
                        new Server().url("/").description("Default Server URL")
                ))
                .addSecurityItem(new SecurityRequirement().addList(jwtSchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(jwtSchemeName,
                                        new SecurityScheme()
                                                .name(jwtSchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                );
    }
}
