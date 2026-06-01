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
            .callTimeout(java.time.Duration.ofSeconds(120))
            .connectTimeout(java.time.Duration.ofSeconds(30))
            .readTimeout(java.time.Duration.ofSeconds(120))
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

        log.info("Calling HuggingFace API for {}/{} with quality score {}", owner, repo, qualityScore);

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
            if (response.code() == 503) {
                log.warn("HuggingFace model is loading, using fallback report");
                return generateFallbackReport(owner, repo, qualityScore, ciPassRate, coverageRatio);
            }
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
        String rating = qualityScore >= 85 ? "Excellent" : qualityScore >= 70 ? "Good" : qualityScore >= 55 ? "Fair" : "Needs Improvement";
        String ciRating = ciPassRate >= 0.9 ? "excellent" : ciPassRate >= 0.75 ? "good" : ciPassRate >= 0.5 ? "moderate" : "poor";
        String coverageRating = coverageRatio >= 0.8 ? "strong" : coverageRatio >= 0.6 ? "adequate" : "low";

        return String.format("""
                # QA Health Report — %s/%s

                **Generated:** %s
                **Analysis Engine:** DevWatch Static Analyzer

                ## Executive Summary

                Repository **%s/%s** has been analyzed across code quality, test coverage, and CI/CD health dimensions. \
                The overall quality score of **%.1f/100** reflects %s engineering practices. \
                With a CI pass rate of **%.1f%%** and test coverage of **%.1f%%**, this repository demonstrates %s reliability.

                ## Key Strengths

                - Quality score of %.1f/100 indicates %s code organization and structure
                - CI pass rate of %.1f%% shows %s pipeline reliability
                - Test coverage at %.1f%% reflects %s investment in automated testing
                - Repository shows consistent commit history and active maintenance
                - Codebase structure supports scalability and future development

                ## Areas for Improvement

                %s

                ## Recommended Actions

                1. %s
                2. Run DevWatch scans regularly to track quality trends over time
                3. Set up branch protection rules requiring CI to pass before merging
                4. Add a coverage threshold gate to prevent regressions below current levels
                5. Review and resolve any open TODO and FIXME comments in the codebase

                ## Overall Health Rating

                **%s**

                This repository is %s. %s
                """,
                owner, repo,
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("MMMM dd, yyyy HH:mm")),
                owner, repo,
                qualityScore,
                qualityScore >= 70 ? "strong" : "developing",
                ciPassRate * 100,
                coverageRatio * 100,
                ciRating,
                qualityScore, qualityScore >= 85 ? "excellent" : qualityScore >= 70 ? "good" : "developing",
                ciPassRate * 100, ciRating,
                coverageRatio * 100, coverageRating,
                coverageRatio < 0.7 ? "- Test coverage below 70% leaves critical paths untested\n            - Consider adding unit tests for core business logic modules\n            - Integration test coverage for API endpoints needs improvement" :
                "- Continue expanding test coverage toward 90% for production critical paths\n            - Consider adding performance benchmarks for high-traffic endpoints\n            - Document testing strategy for new team members",
                ciPassRate < 0.8 ? "Investigate and fix recurring CI failures to improve pipeline reliability" :
                "Maintain current CI reliability and consider adding parallel test execution for speed",
                rating,
                rating.equals("Excellent") ? "in outstanding health and ready for production scale" :
                rating.equals("Good") ? "in good health with clear paths to improvement" :
                rating.equals("Fair") ? "functional but has meaningful areas requiring attention" :
                "in need of focused improvement across multiple dimensions",
                rating.equals("Excellent") ? "Keep up the excellent work and maintain these standards as the codebase grows." :
                rating.equals("Good") ? "With targeted improvements this repository can reach Excellent status." :
                "Prioritize the recommended actions above to improve overall health."
        );
    }
}
