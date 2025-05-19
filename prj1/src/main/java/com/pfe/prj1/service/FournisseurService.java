package com.pfe.prj1.service;

import com.pfe.prj1.dto.FournisseurDTO;
import com.pfe.prj1.model.Account;
import com.pfe.prj1.model.Fournisseur;
import com.pfe.prj1.repository.AccountRepository;
import com.pfe.prj1.repository.FactureRepository;
import com.pfe.prj1.repository.FournisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FournisseurService {
    private final FournisseurRepository fournisseurRepository;
    private final AccountRepository accountRepository;
    private final FactureRepository factureRepository;


    @Autowired
    public FournisseurService(FournisseurRepository fournisseurRepository, AccountRepository accountRepository, FactureRepository factureRepository) {
        this.fournisseurRepository = fournisseurRepository;
        this.accountRepository = accountRepository;
        this.factureRepository = factureRepository;

    }

    public List<Fournisseur> getAllFournisseursByAccountId(int accountId) {
        return fournisseurRepository.findAllByAccountId(accountId);
    }

    public Fournisseur getFournisseurByIdAndAccount(int id, int accountId) {
        return fournisseurRepository.findByIdAndAccountId(id, accountId)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
    }

    @Transactional
    public Fournisseur saveFournisseur(Fournisseur fournisseur, int accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Compte non trouvé"));

        // Vérification de l'unicité des champs
        Optional<Fournisseur> existingByIdentifiant = fournisseurRepository
                .findByIdentifiantAndAccountId(fournisseur.getIdentifiant(), accountId);
        if (existingByIdentifiant.isPresent()) {
            throw new RuntimeException("Un fournisseur avec cet identifiant existe déjà");
        }

        Optional<Fournisseur> existingByMatricule = fournisseurRepository
                .findByMatriculeFiscaleAndAccountId(fournisseur.getMatriculeFiscale(), accountId);
        if (existingByMatricule.isPresent()) {
            throw new RuntimeException("Un fournisseur avec ce matricule fiscal existe déjà");
        }

        Optional<Fournisseur> existingByEmail = fournisseurRepository
                .findByEmailAndAccountId(fournisseur.getEmail(), accountId);
        if (existingByEmail.isPresent()) {
            throw new RuntimeException("Un fournisseur avec cet email existe déjà");
        }

        fournisseur.setAccount(account);
        return fournisseurRepository.save(fournisseur);
    }

    @Transactional
    public Fournisseur updateFournisseur(int fournisseurId, Fournisseur fournisseur, int accountId) {
        Fournisseur existingFournisseur = fournisseurRepository.findByIdAndAccountId(fournisseurId, accountId)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));

        if (!existingFournisseur.getMatriculeFiscale().equals(fournisseur.getMatriculeFiscale())) {
            Optional<Fournisseur> existingByMatricule = fournisseurRepository
                    .findByMatriculeFiscaleAndAccountId(fournisseur.getMatriculeFiscale(), accountId);
            if (existingByMatricule.isPresent()) {
                throw new RuntimeException("Un fournisseur avec ce matricule fiscal existe déjà");
            }
        }

        if (!existingFournisseur.getEmail().equals(fournisseur.getEmail())) {
            Optional<Fournisseur> existingByEmail = fournisseurRepository
                    .findByEmailAndAccountId(fournisseur.getEmail(), accountId);
            if (existingByEmail.isPresent()) {
                throw new RuntimeException("Un fournisseur avec cet email existe déjà");
            }
        }

        existingFournisseur.setNom(fournisseur.getNom());
        existingFournisseur.setIdentifiant(fournisseur.getIdentifiant());
        existingFournisseur.setMatriculeFiscale(fournisseur.getMatriculeFiscale());
        existingFournisseur.setTel(fournisseur.getTel());
        existingFournisseur.setFax(fournisseur.getFax());
        existingFournisseur.setEmail(fournisseur.getEmail());
        existingFournisseur.setPays(fournisseur.getPays());
        existingFournisseur.setAdresse(fournisseur.getAdresse());
        existingFournisseur.setCodePostal(fournisseur.getCodePostal());

        return fournisseurRepository.save(existingFournisseur);
    }

    @Transactional
    public void deleteFournisseur(int fournisseurId, int accountId) {
        Fournisseur fournisseur = fournisseurRepository.findByIdAndAccountId(fournisseurId, accountId)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
        // Vérifier si l'article est utilisé dans des factures
        boolean isUsedInFactures = factureRepository.existsByFournisseurId(fournisseurId);

        if (isUsedInFactures) {
            throw new RuntimeException(
                    "Impossible de supprimer le fournisseur car il est utilisé dans une ou plusieurs factures");
        }
        fournisseurRepository.delete(fournisseur);
    }

    public Fournisseur convertDtoToEntity(FournisseurDTO fournisseurDTO) {
        Fournisseur fournisseur = new Fournisseur();
        fournisseur.setNom(fournisseurDTO.getNom());
        fournisseur.setIdentifiant(fournisseurDTO.getIdentifiant());
        fournisseur.setMatriculeFiscale(fournisseurDTO.getMatriculeFiscale());
        fournisseur.setTel(fournisseurDTO.getTel());
        fournisseur.setFax(fournisseurDTO.getFax());
        fournisseur.setEmail(fournisseurDTO.getEmail());
        fournisseur.setPays(fournisseurDTO.getPays());
        fournisseur.setAdresse(fournisseurDTO.getAdresse());
        fournisseur.setCodePostal(fournisseurDTO.getCodePostal());
        return fournisseur;
    }
}