package com.pfe.prj1.service;

import com.pfe.prj1.model.Account;
import com.pfe.prj1.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    @Autowired
    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> getAllComptes() {
        return accountRepository.findAll();
    }

    public Account getCompteById(int compteId) {
        return accountRepository.findById(compteId)
                .orElseThrow(() -> new RuntimeException("Compte avec l'ID " + compteId + " non trouvé"));
    }

    public Account saveCompte(Account compte) {
        return accountRepository.save(compte);
    }

    public void deleteCompte(int compteId) {
        boolean exists = accountRepository.existsById(compteId);
        if (!exists) {
            throw new RuntimeException("Un compte avec cet id " + compteId + " n'existe pas");
        }
        accountRepository.deleteById(compteId);
    }
}