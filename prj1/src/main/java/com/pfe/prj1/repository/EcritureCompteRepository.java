package com.pfe.prj1.repository;

import com.pfe.prj1.model.EcritureCompte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EcritureCompteRepository extends JpaRepository<EcritureCompte, Integer> {
    boolean existsByCompteId(Long compteId);
    
}