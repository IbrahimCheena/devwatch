package com.devwatch.repository;

import com.devwatch.entity.CoverageSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoverageSnapshotRepository extends JpaRepository<CoverageSnapshot, Long> {
    List<CoverageSnapshot> findTop30ByRepoIdOrderByRecordedAtDesc(Long repoId);
}
