package com.devwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qa_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QAReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long repoId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Double qualityScore;
    private Double ciPassRate;
    private LocalDateTime generatedAt;

    @PrePersist
    protected void onCreate() {
        generatedAt = LocalDateTime.now();
    }
}
