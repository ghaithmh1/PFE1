package com.pfe.prj1.repository;

import com.pfe.prj1.model.GrandLivre;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface GrandLivreRepository extends JpaRepository<GrandLivre, Long> {
    @Query("SELECT gl FROM GrandLivre gl LEFT JOIN FETCH gl.facture LEFT JOIN FETCH gl.ligne")
    List<GrandLivre> findAllWithDetails();

    @Modifying
    @Query("DELETE FROM GrandLivre gl WHERE gl.facture.id = :factureId")
    void deleteByFactureId(Long factureId);

    void deleteByReference(String reference);

}