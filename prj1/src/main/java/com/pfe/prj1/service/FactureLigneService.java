package com.pfe.prj1.service;

import com.pfe.prj1.model.FactureLigne;
import com.pfe.prj1.repository.FactureLigneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FactureLigneService {
    private final FactureLigneRepository repository;

    public List<FactureLigne> findAll() {
        return repository.findAll();
    }

    public Optional<FactureLigne> findById(Long id) {
        return repository.findById(id);
    }

    public FactureLigne save(FactureLigne ligne) {
        return repository.save(ligne);
    }
    public Optional<FactureLigne> update(Long id, FactureLigne updated) {
        return repository.findById(id).map(existing -> {
            existing.setQuantite(updated.getQuantite());
            existing.setPrixUnitaire(updated.getPrixUnitaire());
            existing.setTvaRate(updated.getTvaRate());
            existing.setArticle(updated.getArticle());
            existing.setCompte(updated.getCompte());
    
            return repository.save(existing);
        });
    }
    

    public void delete(Long id) {
        repository.deleteById(id);
    }
}