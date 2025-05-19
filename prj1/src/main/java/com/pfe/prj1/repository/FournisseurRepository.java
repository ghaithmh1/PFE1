package com.pfe.prj1.repository;

import com.pfe.prj1.model.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FournisseurRepository extends JpaRepository<Fournisseur, Integer> {
    @Query("SELECT f FROM Fournisseur f WHERE f.identifiant = ?1 AND f.account.id = ?2")
    Optional<Fournisseur> findByIdentifiantAndAccountId(String identifiant, int accountId);

    @Query("SELECT f FROM Fournisseur f WHERE f.matriculeFiscale = ?1 AND f.account.id = ?2")
    Optional<Fournisseur> findByMatriculeFiscaleAndAccountId(String matriculeFiscale, int accountId);

    List<Fournisseur> findAllByAccountId(int accountId);

    Optional<Fournisseur> findByIdAndAccountId(int id, int accountId);

    Optional<Fournisseur> findByEmailAndAccountId(String email, int accountId);
}