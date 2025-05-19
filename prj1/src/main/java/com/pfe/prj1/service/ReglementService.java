package com.pfe.prj1.service;

import com.pfe.prj1.model.Reglement;
import com.pfe.prj1.repository.ReglementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReglementService {

    @Autowired
    private ReglementRepository reglementRepository;

    public List<Reglement> getAllReglements() {
        return reglementRepository.findAll();
    }

    public Optional<Reglement> getReglementById(int id) {
        return reglementRepository.findById(id);
    }

    public Reglement createReglement(Reglement reglement) {
        return reglementRepository.save(reglement);
    }

    public Reglement updateReglement(int id, Reglement reglementDetails) {
        Optional<Reglement> existingReglement = reglementRepository.findById(id);
        if (existingReglement.isPresent()) {
            Reglement reglement = existingReglement.get();
            reglement.setDateReglement(reglementDetails.getDateReglement());
            reglement.setModePaiement(reglementDetails.getModePaiement());
            reglement.setMontant(reglementDetails.getMontant());
            reglement.setNumeroAvoir(reglementDetails.getNumeroAvoir());
            reglement.setNumeroCheque(reglementDetails.getNumeroCheque());
            reglement.setRefVirement(reglementDetails.getRefVirement());
            reglement.setFacture(reglementDetails.getFacture());
            reglement.setReglementFacture(reglementDetails.isReglementFacture());
            reglement.setBanqueNom(reglementDetails.getBanqueNom());
            return reglementRepository.save(reglement);
        }
        return null;
    }

    public void deleteReglement(int id) {
        Optional<Reglement> reglement = reglementRepository.findById(id);
        reglement.ifPresent(value -> reglementRepository.delete(value));
    }
}
