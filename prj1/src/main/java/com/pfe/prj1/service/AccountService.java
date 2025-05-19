package com.pfe.prj1.service;

import com.pfe.prj1.model.Account;
import com.pfe.prj1.model.Utilisateur;
import com.pfe.prj1.repository.AccountRepository;
import com.pfe.prj1.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Autowired
    public AccountService(AccountRepository accountRepository,
                         UtilisateurRepository utilisateurRepository) {
        this.accountRepository = accountRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Account> getAllComptes() {
        return accountRepository.findAll();
    }

    public Account getCompteById(int compteId) {
        return accountRepository.findById(compteId)
                .orElseThrow(() -> new RuntimeException("Compte non trouvé"));
    }

    public Account saveCompte(Account compte) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Utilisateur currentUser = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Utilisateur non trouvé"));
        
        if(currentUser.getEntreprise() == null) {
            throw new IllegalStateException("L'utilisateur doit être associé à une entreprise");
        }
        
        compte.setEntreprise(currentUser.getEntreprise());
        return accountRepository.save(compte);
    }

    public void deleteCompte(int compteId) {
        accountRepository.deleteById(compteId);
    }

    public List<Account> getAccountsByCurrentEnterprise() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Utilisateur currentUser = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new SecurityException("Utilisateur non trouvé"));
        
        return accountRepository.findByEntreprise_Id(currentUser.getEntreprise().getId());
    }
}