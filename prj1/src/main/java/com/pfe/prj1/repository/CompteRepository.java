package com.pfe.prj1.repository;

import com.pfe.prj1.model.Classe;
import com.pfe.prj1.model.Compte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompteRepository extends JpaRepository<Compte, Long> {
    List<Compte> findByParentIdIsNull();
    Compte findByNumero(String numero);
    List<Compte> findByParentId(Long id);
    boolean existsByNumero(String numero);
    List<Compte> findByClasseId(Long classeId);



}