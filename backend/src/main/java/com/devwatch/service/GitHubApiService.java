package com.devwatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubApiService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${github.api.base-url}")
    private String baseUrl;

    private JsonNode get(String url, String token) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/vnd.github+json")
                .header("X-GitHub-Api-Version", "2022-11-28")
                .build();
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("GitHub API error: " + response.code() + " for " + url);
            }
            return objectMapper.readTree(response.body().string());
        }
    }

    public JsonNode listUserRepos(String token) throws IOException {
        return get(baseUrl + "/user/repos?per_page=50&sort=updated&type=all", token);
    }

    public JsonNode getWorkflowRuns(String token, String owner, String repo) throws IOException {
        return get(baseUrl + "/repos/" + owner + "/" + repo + "/actions/runs?per_page=30", token);
    }

    public JsonNode getRepoInfo(String token, String owner, String repo) throws IOException {
        return get(baseUrl + "/repos/" + owner + "/" + repo, token);
    }

    public JsonNode getRepoContents(String token, String owner, String repo, String path) throws IOException {
        return get(baseUrl + "/repos/" + owner + "/" + repo + "/contents/" + path, token);
    }
}
