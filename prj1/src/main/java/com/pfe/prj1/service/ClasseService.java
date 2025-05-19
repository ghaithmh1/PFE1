package com.pfe.prj1.service;

import com.pfe.prj1.model.Classe;
import com.pfe.prj1.repository.ClasseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClasseService {
    private final ClasseRepository classeRepository;

    @Autowired
    public ClasseService(ClasseRepository classeRepository) {
        this.classeRepository = classeRepository;
    }

    public List<Classe> getAllClasses() {
        return classeRepository.findAll();
    }

    public Classe getClasseById(int classeId) {
        return classeRepository.findById(classeId)
                .orElseThrow(() -> new RuntimeException("Classe avec l'ID " + classeId + " non trouvée"));
    }

    public void saveClasse(Classe classe) {
        Optional<Classe> existingClasse = classeRepository.findByNumero(classe.getNumero());
        if (existingClasse.isPresent()) {
            throw new RuntimeException("Une classe avec ce numéro " + classe.getNumero() + " existe déjà");
        }

        // Si la classe n'existe pas, la sauvegarder
        classeRepository.save(classe);
    }

    public Classe updateClasse(int classeId, Classe classe) {
        Classe existingClasse = classeRepository.findById(classeId)
                .orElseThrow(() -> new RuntimeException("Classe avec l'ID " + classeId + " non trouvée"));

        // Mettre à jour les champs
        existingClasse.setNumero(classe.getNumero());
        existingClasse.setNom(classe.getNom());
        existingClasse.setPlanComptable(classe.getPlanComptable());

        return classeRepository.save(existingClasse);
    }

    public void deleteClasse(int classeId) {
        boolean exists = classeRepository.existsById(classeId);
        if (!exists) {
            throw new RuntimeException("Une classe avec cet ID " + classeId + " n'existe pas");
        }
        classeRepository.deleteById(classeId);
    }
}