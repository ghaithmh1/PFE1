package com.pfe.prj1.service;

import com.pfe.prj1.model.GrandLivre;
import com.pfe.prj1.repository.GrandLivreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Date;

@Service
public class GrandLivreService {
    private final GrandLivreRepository grandLivreRepository;

    public GrandLivreService(GrandLivreRepository grandLivreRepository) {
        this.grandLivreRepository = grandLivreRepository;
    }

    public List<GrandLivre> getAllEntries() {
        return grandLivreRepository.findAllWithDetails();
    }

    public GrandLivre saveEcritureDetails(String ecritureRef, String compteNom, 
                                        String compteNum, Double debit, 
                                        Double credit, Date createdAt) {
        GrandLivre entry = new GrandLivre();
        entry.populateFromEcritureDetails(ecritureRef, compteNom, compteNum, 
                                        debit, credit, createdAt);
        return grandLivreRepository.save(entry);
    }
    @Transactional
    public void deleteEcrituresByReference(String reference) {
        // Supprimer toutes les entrées du grand livre correspondant à cette référence
        grandLivreRepository.deleteByReference(reference);
    }
}