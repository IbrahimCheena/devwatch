package com.devwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coverage_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoverageSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long repoId;
    private Integer totalFiles;
    private Integer testFiles;
    private Double coverageRatio;
    private Double qualityScore;
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        recordedAt = LocalDateTime.now();
    }
}
