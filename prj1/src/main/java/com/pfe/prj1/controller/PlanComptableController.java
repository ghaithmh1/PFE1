package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.model.PlanComptable;
import com.pfe.prj1.service.PlanComptableService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plan-comptables")
public class PlanComptableController {
    @Autowired
    private PlanComptableService planComptableService;

    @GetMapping
    public List<PlanComptable> getAllPlanComptables() {
        return planComptableService.getAllPlanComptables();
    }

    @GetMapping("/{planComptableId}")
    public ResponseEntity<ApiResponse> getPlanComptableById(@PathVariable("planComptableId") int planComptableId) {
        try {
            PlanComptable planComptable = planComptableService.getPlanComptableById(planComptableId);
            return ResponseEntity.ok(new ApiResponse("Plan comptable récupéré avec succès", planComptable));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createPlanComptable(@Valid @RequestBody PlanComptable planComptable) {
        try {
            planComptableService.savePlanComptable(planComptable);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Plan comptable créé avec succès", planComptable));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{planComptableId}")
    public ResponseEntity<ApiResponse> updatePlanComptable(@PathVariable("planComptableId") int planComptableId, @Valid @RequestBody PlanComptable planComptable) {
        try {
            PlanComptable updatedPlanComptable = planComptableService.updatePlanComptable(planComptableId, planComptable);
            return ResponseEntity.ok(new ApiResponse("Plan comptable mis à jour avec succès", updatedPlanComptable));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{planComptableId}")
    public ResponseEntity<ApiResponse> deletePlanComptable(@PathVariable("planComptableId") int planComptableId) {
        try {
            planComptableService.deletePlanComptable(planComptableId);
            return ResponseEntity.ok(new ApiResponse("Plan comptable supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }
}