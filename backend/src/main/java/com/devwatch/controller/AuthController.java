package com.devwatch.controller;

import com.devwatch.entity.User;
import com.devwatch.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/github")
    public ResponseEntity<?> githubAuth(@RequestBody Map<String, String> body) {
        String token = body.get("access_token");
        if (token == null) return ResponseEntity.badRequest().body(Map.of("error", "access_token required"));

        try {
            Request request = new Request.Builder()
                    .url("https://api.github.com/user")
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/vnd.github+json")
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode userData = objectMapper.readTree(response.body().string());
                String githubId = userData.get("id").asText();
                String login = userData.get("login").asText();
                String avatarUrl = userData.get("avatar_url").asText();

                User user = userRepository.findByGithubId(githubId).orElse(
                        User.builder().githubId(githubId).login(login)
                                .avatarUrl(avatarUrl).accessToken(token).build()
                );
                user.setAccessToken(token);
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);

                return ResponseEntity.ok(Map.of(
                        "id", user.getId(),
                        "login", user.getLogin(),
                        "avatar_url", user.getAvatarUrl()
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
