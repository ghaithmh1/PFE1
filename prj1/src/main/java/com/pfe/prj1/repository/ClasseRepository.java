package com.pfe.prj1.repository;

import com.pfe.prj1.model.Article;
import com.pfe.prj1.model.Classe;
import com.pfe.prj1.model.PlanComptable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClasseRepository extends JpaRepository<Classe, Integer> {

    Optional<Classe> findByNumero(String numero);




}