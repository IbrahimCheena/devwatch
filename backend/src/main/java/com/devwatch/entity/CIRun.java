package com.devwatch.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ci_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CIRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long repoId;
    private String workflowName;
    private String status;
    private String conclusion;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long durationMs;
    private Long githubRunId;
}
