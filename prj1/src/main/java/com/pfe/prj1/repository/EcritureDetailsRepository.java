package com.pfe.prj1.repository;

import com.pfe.prj1.model.EcritureDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EcritureDetailsRepository extends JpaRepository<EcritureDetails, Integer> {
}