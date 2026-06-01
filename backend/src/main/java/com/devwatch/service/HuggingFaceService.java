package com.devwatch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@Slf4j
public class HuggingFaceService {

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .callTimeout(java.time.Duration.ofSeconds(60))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${huggingface.api.url}")
    private String apiUrl;

    @Value("${huggingface.api.token}")
    private String apiToken;

    public String generateQAReport(String owner, String repo, double qualityScore,
                                    double ciPassRate, double coverageRatio, int totalFiles, int testFiles) throws IOException {
        String prompt = String.format("""
                <s>[INST] You are a senior software engineer reviewing a GitHub repository's health metrics.

                Repository: %s/%s
                Quality Score: %.1f/100
                CI Pass Rate: %.1f%%
                Test Coverage: %.1f%% (%d test files out of %d total files)

                Write a professional QA health report in markdown format. Include:
                1. Executive Summary (2-3 sentences)
                2. Key Strengths
                3. Areas for Improvement
                4. Recommended Actions (numbered list)
                5. Overall Health Rating (Excellent/Good/Fair/Poor)

                Be specific, actionable, and concise. [/INST]
                """, owner, repo, qualityScore, ciPassRate * 100, coverageRatio * 100, testFiles, totalFiles);

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("inputs", prompt);
        ObjectNode parameters = objectMapper.createObjectNode();
        parameters.put("max_new_tokens", 800);
        parameters.put("temperature", 0.7);
        parameters.put("return_full_text", false);
        payload.set("parameters", parameters);

        Request request = new Request.Builder()
                .url(apiUrl)
                .header("Authorization", "Bearer " + apiToken)
                .post(RequestBody.create(objectMapper.writeValueAsString(payload),
                        MediaType.parse("application/json")))
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                log.error("HuggingFace API error: {}", response.code());
                return generateFallbackReport(owner, repo, qualityScore, ciPassRate, coverageRatio);
            }
            JsonNode result = objectMapper.readTree(response.body().string());
            if (result.isArray() && result.size() > 0) {
                return result.get(0).get("generated_text").asText();
            }
            return generateFallbackReport(owner, repo, qualityScore, ciPassRate, coverageRatio);
        }
    }

    private String generateFallbackReport(String owner, String repo, double qualityScore,
                                           double ciPassRate, double coverageRatio) {
        return String.format("""
                # QA Health Report — %s/%s

                ## Executive Summary
                Repository analysis complete. Overall quality score: **%.1f/100**.

                ## Key Metrics
                - **CI Pass Rate:** %.1f%%
                - **Test Coverage:** %.1f%%
                - **Quality Score:** %.1f/100

                ## Overall Health Rating
                %s
                """, owner, repo, qualityScore, ciPassRate * 100, coverageRatio * 100, qualityScore,
                qualityScore >= 80 ? "✅ Good" : qualityScore >= 60 ? "⚠️ Fair" : "❌ Needs Improvement");
    }
}
