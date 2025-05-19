package com.pfe.prj1.service;

import com.pfe.prj1.model.Entreprise;
import com.pfe.prj1.repository.EntrepriseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EntrepriseService {

    @Autowired
    private EntrepriseRepository entrepriseRepository;

    public List<Entreprise> getAllEntreprises() {
        return entrepriseRepository.findAll();
    }

    public Optional<Entreprise> getEntrepriseById(int id) {
        return entrepriseRepository.findById(id);
    }

    public Entreprise createEntreprise(Entreprise entreprise) {
        entreprise.setUuid(UUID.randomUUID().toString());
        entreprise.setDateCreated(new Date());
        entreprise.setDateUpdated(new Date());
        entreprise.setVersion(1);
        return entrepriseRepository.save(entreprise);
    }

    public Entreprise updateEntreprise(int id, Entreprise entrepriseDetails) {
        return entrepriseRepository.findById(id).map(entreprise -> {
            entreprise.setNom(entrepriseDetails.getNom());
            entreprise.setAdresse(entrepriseDetails.getAdresse());
            entreprise.setCodePostal(entrepriseDetails.getCodePostal());
            entreprise.setFax(entrepriseDetails.getFax());
            entreprise.setMail(entrepriseDetails.getMail());
            entreprise.setMatriculeFiscale(entrepriseDetails.getMatriculeFiscale());
            entreprise.setPays(entrepriseDetails.getPays());
            entreprise.setTel(entrepriseDetails.getTel());
            entreprise.setVille(entrepriseDetails.getVille());
            entreprise.setDevise(entrepriseDetails.getDevise());
            entreprise.setIdPays(entrepriseDetails.getIdPays());
            entreprise.setDateUpdated(new Date());
            return entrepriseRepository.save(entreprise);
        }).orElse(null);
    }

    public void deleteEntreprise(int id) {
        entrepriseRepository.deleteById(id);
    }
}
