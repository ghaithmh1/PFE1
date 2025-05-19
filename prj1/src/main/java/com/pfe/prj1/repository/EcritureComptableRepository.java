package com.pfe.prj1.repository;

import com.pfe.prj1.model.EcritureComptable;
import com.pfe.prj1.model.Statut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface EcritureComptableRepository extends JpaRepository<EcritureComptable, Integer> {
    List<EcritureComptable> findByReference(String reference);

    List<EcritureComptable> findByStatut(Statut statut);

    List<EcritureComptable> findByDateBetween(Date dateDebut, Date dateFin);

    @Query("SELECT MAX(e.num) FROM EcritureComptable e")
    String findMaxNumero();


}