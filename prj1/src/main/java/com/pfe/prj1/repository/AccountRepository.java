package com.pfe.prj1.repository;

import com.pfe.prj1.model.Account;
import com.pfe.prj1.model.Entreprise;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Integer> {
    List<Account> findByEntreprise_Id(int entrepriseId);
     List<Account> findByEntreprise(Entreprise entreprise);
}