package com.pfe.prj1.repository;

import com.pfe.prj1.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Integer> {
    @Query("SELECT c FROM Client c WHERE c.identifiant = ?1 AND c.entreprise.id = ?2")
    Optional<Client> findByIdentifiantAndEntrepriseId(String identifiant, int entrepriseId);

    List<Client> findAllByEntrepriseId(int entrepriseId);
    Optional<Client> findByIdAndEntrepriseId(int id, int entrepriseId);
    Optional<Client> findByEmailAndEntrepriseId(String email, int entrepriseId);
}