package com.pfe.prj1.repository;

import com.pfe.prj1.model.Client;
import com.pfe.prj1.model.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface FactureRepository extends JpaRepository<Facture, Long> {
    @Query("SELECT f FROM Facture f " +
           "LEFT JOIN FETCH f.client " +
           "LEFT JOIN FETCH f.fournisseur " +
           "LEFT JOIN FETCH f.lignes l " +
           "LEFT JOIN FETCH l.compte " +
           "LEFT JOIN FETCH l.article " +
           "WHERE f.id = :id")
    Optional<Facture> findByIdWithLignes(@Param("id") Long id);

    @Query("SELECT DISTINCT f FROM Facture f " +
           "LEFT JOIN FETCH f.client " +
           "LEFT JOIN FETCH f.fournisseur " +
           "LEFT JOIN FETCH f.lignes l " +
           "LEFT JOIN FETCH l.compte " +
           "LEFT JOIN FETCH l.article")
    List<Facture> findAllWithLignes();

    boolean existsByClientId(int clientId);
    boolean existsByFournisseurId(int fournisseurId);
    boolean existsBycompteId(Long compteId);


    List<Facture> findByClientId(int clientId);

    List<Facture> findByFournisseurId(int fournisseurId);
}