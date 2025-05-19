package com.pfe.prj1.repository;

import com.pfe.prj1.model.FactureLigne;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FactureLigneRepository extends JpaRepository<FactureLigne, Long> {
    boolean existsByArticleId(int articleId);
}
