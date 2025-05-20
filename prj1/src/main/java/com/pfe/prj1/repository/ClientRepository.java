package com.pfe.prj1.repository;

import com.pfe.prj1.model.Article;
import com.pfe.prj1.model.Client;
import com.pfe.prj1.model.Account;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    // Trouver un client par identifiant et compte
    @Query("SELECT c FROM Client c WHERE c.identifiant = ?1 AND c.account.id = ?2")
    Optional<Client> findByIdentifiantAndAccountId(String identifiant, int accountId);

    // Récupérer tous les clients d'un compte spécifique
    List<Client> findAllByAccountId(int accountId);

    Optional<Client> findByIdAndAccountId(int id, int accountId);

    // Trouver un client par email et compte
    Optional<Client> findByEmailAndAccountId(String email, int accountId);
}