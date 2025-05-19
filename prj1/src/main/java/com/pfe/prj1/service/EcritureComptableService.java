package com.pfe.prj1.service;

import com.pfe.prj1.dto.EcritureComptableDTO;
import com.pfe.prj1.mapper.EcritureComptableMapper;
import com.pfe.prj1.model.*;
import com.pfe.prj1.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Service
public class EcritureComptableService {

    private final EcritureComptableRepository ecritureComptableRepository;
    private final EcritureCompteRepository ecritureCompteRepository;
    private final CompteRepository compteRepository;
    private final GrandLivreService grandLivreService;
    private final EcritureComptableMapper ecritureComptableMapper;


    @Autowired
    public EcritureComptableService(
            EcritureComptableRepository ecritureComptableRepository,
            EcritureCompteRepository ecritureCompteRepository,
            CompteRepository compteRepository,
            GrandLivreService grandLivreService,
            EcritureComptableMapper ecritureComptableMapper) {
        this.ecritureComptableRepository = ecritureComptableRepository;
        this.ecritureCompteRepository = ecritureCompteRepository;
        this.compteRepository = compteRepository;
        this.grandLivreService = grandLivreService;
        this.ecritureComptableMapper = ecritureComptableMapper;
    }

    @Transactional
    public EcritureComptableDTO createEcriture(EcritureComptableDTO ecritureDTO) {
        // Convertir le DTO en entité
        EcritureComptable ecriture = ecritureComptableMapper.toEntity(ecritureDTO);

        // Utiliser la méthode existante pour créer l'écriture
        EcritureComptable savedEcriture = createEcritureEntity(ecriture);

        // Convertir l'entité sauvegardée en DTO pour le retour
        return ecritureComptableMapper.toDTO(savedEcriture);
    }

    // Méthode originale renommée pour éviter les conflits
    @Transactional
    public EcritureComptable createEcritureEntity(EcritureComptable ecriture) {
        validateEcriture(ecriture);

        if (ecriture.getNum() == null) {
            String maxNumero = ecritureComptableRepository.findMaxNumero();
            int nextNumber = maxNumero != null ?
                    Integer.parseInt(maxNumero.substring(maxNumero.lastIndexOf("-") + 1)) + 1 :
                    1;
            int year = LocalDate.now().getYear();
            ecriture.setNum("AG-" + year + "-" + nextNumber);
        }

        EcritureComptable savedEcriture = ecritureComptableRepository.save(ecriture);

        for (EcritureCompte ligne : ecriture.getLignes()) {
            ligne.setEcritureComptable(savedEcriture);
            ecritureCompteRepository.save(ligne);

            updateGrandLivre(savedEcriture.getReference(), ligne);
        }

        return savedEcriture;
    }

    // Nouvelle méthode pour mettre à jour le grand livre
    private void updateGrandLivre(String reference, EcritureCompte ligne) {
        grandLivreService.saveEcritureDetails(
                reference,
                ligne.getCompte().getNom(),
                ligne.getCompte().getNumero(),
                ligne.getDebit(),
                ligne.getCredit(),
                new Date()
        );
    }

    private void validateEcriture(EcritureComptable ecriture) {
        if (ecriture.getLignes() == null || ecriture.getLignes().isEmpty()) {
            throw new IllegalArgumentException("L'écriture doit contenir au moins une ligne");
        }

        if (ecriture.getLignes().size() < 2) {
            throw new IllegalArgumentException("L'écriture doit contenir au moins deux lignes");
        }

        boolean hasDebit = false;
        boolean hasCredit = false;

        for (EcritureCompte ligne : ecriture.getLignes()) {
            Compte compte = compteRepository.findById(ligne.getCompte().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Compte introuvable avec l'ID: " + ligne.getCompte().getId()));
            ligne.setCompte(compte);

            if (ligne.getDebit() < 0 || ligne.getCredit() < 0) {
                throw new IllegalArgumentException("Les montants ne peuvent pas être négatifs");
            }

            if (ligne.getDebit() > 0) hasDebit = true;
            if (ligne.getCredit() > 0) hasCredit = true;

            if (ligne.getDebit() > 0 && ligne.getCredit() > 0) {
                throw new IllegalArgumentException("Une ligne ne peut pas avoir à la fois un débit et un crédit");
            }

            if (ligne.getDescription() == null || ligne.getDescription().trim().isEmpty()) {
                throw new IllegalArgumentException("Chaque ligne doit avoir une description");
            }
        }

        if (!hasDebit || !hasCredit) {
            throw new IllegalArgumentException("L'écriture doit contenir au moins une ligne au débit et une au crédit");
        }

        if (!ecriture.estEquilibre()) {
            throw new IllegalArgumentException("L'écriture n'est pas équilibrée. Différence: "
                    + Math.abs(ecriture.getTotalDebit() - ecriture.getTotalCredit()));
        }
    }

    public List<EcritureComptable> getAllEcrituresComptables() {
        return ecritureComptableRepository.findAll();
    }

    public EcritureComptable getEcritureById(int id) {
        return ecritureComptableRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Écriture non trouvée avec l'ID: " + id));
    }

    public List<EcritureComptable> getEcrituresByReference(String reference) {
        return ecritureComptableRepository.findByReference(reference);
    }

    public List<EcritureComptable> getEcrituresByStatut(Statut statut) {
        return ecritureComptableRepository.findByStatut(statut);
    }

    public List<EcritureComptable> getEcrituresByPeriode(Date dateDebut, Date dateFin) {
        return ecritureComptableRepository.findByDateBetween(dateDebut, dateFin);
    }

    @Transactional
    public EcritureComptableDTO updateEcriture(int id, EcritureComptableDTO ecritureDetailsDTO) {
        try {
            // Convertir le DTO en entité
            EcritureComptable ecritureDetails = ecritureComptableMapper.toEntity(ecritureDetailsDTO);

            // Récupérer l'écriture existante
            EcritureComptable ecriture = getEcritureById(id);

            // Stocker la référence originale pour pouvoir supprimer les anciennes écritures du grand livre si elle change
            String oldReference = ecriture.getReference();

            // S'assurer que le numéro est préservé s'il n'est pas fourni
            if (ecritureDetails.getNum() == null) {
                ecritureDetails.setNum(ecriture.getNum());
            }

            // Validation avec gestion d'exception
            try {
                validateEcriture(ecritureDetails);
            } catch (Exception e) {
                throw new RuntimeException("Erreur de validation: " + e.getMessage(), e);
            }

            // Mettre à jour les champs de base
            ecriture.setNum(ecritureDetails.getNum());
            ecriture.setReference(ecritureDetails.getReference());
            ecriture.setStatut(ecritureDetails.getStatut());
            ecriture.setDate(ecritureDetails.getDate());

            // Gestion des lignes
            try {
                // Si la référence a changé, supprimer les anciennes entrées du grand livre
                if (!oldReference.equals(ecriture.getReference())) {
                    grandLivreService.deleteEcrituresByReference(oldReference);
                } else {
                    // Sinon, supprimer seulement les écritures correspondantes
                    grandLivreService.deleteEcrituresByReference(ecriture.getReference());
                }

                // Supprimer les anciennes lignes
                ecritureCompteRepository.deleteAll(ecriture.getLignes());
                ecriture.getLignes().clear();

                // Ajouter les nouvelles lignes
                for (EcritureCompte ligne : ecritureDetails.getLignes()) {
                    ligne.setEcritureComptable(ecriture);
                    ecriture.getLignes().add(ligne);

                    // Mettre à jour le grand livre avec chaque nouvelle ligne
                    updateGrandLivre(ecriture.getReference(), ligne);
                }

                // Sauvegarder et retourner le DTO
                EcritureComptable updatedEcriture = ecritureComptableRepository.save(ecriture);
                return ecritureComptableMapper.toDTO(updatedEcriture);
            } catch (Exception e) {
                throw new RuntimeException("Erreur lors de la mise à jour des lignes: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            throw e; // Re-lancer pour être géré par le contrôleur
        }
    }

    @Transactional
    public void deleteEcriture(int id) {
        EcritureComptable ecriture = getEcritureById(id);
        if (ecriture == null) {
            throw new EntityNotFoundException("Écriture introuvable avec l'ID: " + id);
        }

        // Supprimer les entrées correspondantes du grand livre
        grandLivreService.deleteEcrituresByReference(ecriture.getReference());

        // Puis supprimer l'écriture comptable
        ecritureComptableRepository.deleteById(id);
    }

    public boolean isEcritureEquilibree(Integer id) {
        EcritureComptable ecriture = getEcritureById(id);
        return ecriture.estEquilibre();
    }
}