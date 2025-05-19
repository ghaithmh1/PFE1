package com.pfe.prj1.service;

import com.pfe.prj1.model.PlanComptable;
import com.pfe.prj1.repository.PlanComptableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlanComptableService {
    private final PlanComptableRepository planComptableRepository;

    @Autowired
    public PlanComptableService(PlanComptableRepository planComptableRepository) {
        this.planComptableRepository = planComptableRepository;
    }

    public List<PlanComptable> getAllPlanComptables() {
        return planComptableRepository.findAll();
    }

    public PlanComptable getPlanComptableById(int planComptableId) {
        return planComptableRepository.findById(planComptableId)
                .orElseThrow(() -> new RuntimeException("Plan comptable avec l'ID " + planComptableId + " non trouvé"));
    }

    public void savePlanComptable(PlanComptable planComptable) {
        Optional<PlanComptable> existingPlanComptable = planComptableRepository.findByNom(planComptable.getNom());
        if (existingPlanComptable.isPresent()) {
            throw new RuntimeException("Un plan comptable avec ce nom " + planComptable.getNom() + " existe déjà");
        }

        // Si le plan comptable n'existe pas, le sauvegarder
        planComptableRepository.save(planComptable);
    }

    public PlanComptable updatePlanComptable(int planComptableId, PlanComptable planComptable) {
        PlanComptable existingPlanComptable = planComptableRepository.findById(planComptableId)
                .orElseThrow(() -> new RuntimeException("Plan comptable avec l'ID " + planComptableId + " non trouvé"));

        // Mettre à jour les champs
        existingPlanComptable.setNom(planComptable.getNom());

        return planComptableRepository.save(existingPlanComptable);
    }

    public void deletePlanComptable(int planComptableId) {
        boolean exists = planComptableRepository.existsById(planComptableId);
        if (!exists) {
            throw new RuntimeException("Un plan comptable avec cet ID " + planComptableId + " n'existe pas");
        }
        planComptableRepository.deleteById(planComptableId);
    }
}