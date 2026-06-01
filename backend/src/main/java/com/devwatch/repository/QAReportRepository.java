package com.devwatch.repository;

import com.devwatch.entity.QAReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface QAReportRepository extends JpaRepository<QAReport, Long> {
    Optional<QAReport> findTopByRepoIdOrderByGeneratedAtDesc(Long repoId);
}
