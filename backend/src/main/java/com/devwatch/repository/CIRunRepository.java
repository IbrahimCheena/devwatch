package com.devwatch.repository;

import com.devwatch.entity.CIRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CIRunRepository extends JpaRepository<CIRun, Long> {
    List<CIRun> findTop30ByRepoIdOrderByStartedAtDesc(Long repoId);
}
