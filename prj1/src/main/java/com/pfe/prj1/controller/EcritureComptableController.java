package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.EcritureComptableDTO;
import com.pfe.prj1.mapper.EcritureComptableMapper;
import com.pfe.prj1.model.EcritureComptable;
import com.pfe.prj1.model.Statut;
import com.pfe.prj1.service.EcritureComptableService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ecriture-comptable")
public class EcritureComptableController {

    @Autowired
    private EcritureComptableService ecritureComptableService;

    @Autowired
    private EcritureComptableMapper ecritureComptableMapper;

    @GetMapping
    public ResponseEntity<List<EcritureComptableDTO>> getAllEcritures() {
        List<EcritureComptable> ecritures = ecritureComptableService.getAllEcrituresComptables();
        List<EcritureComptableDTO> ecrituresDTOs = ecritures.stream()
                .map(ecritureComptableMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ecrituresDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EcritureComptableDTO> getEcritureById(@PathVariable int id) {
        EcritureComptable ecriture = ecritureComptableService.getEcritureById(id);
        EcritureComptableDTO ecritureDTO = ecritureComptableMapper.toDTO(ecriture);
        return ResponseEntity.ok(ecritureDTO);
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<List<EcritureComptableDTO>> getEcrituresByReference(@PathVariable String reference) {
        List<EcritureComptable> ecritures = ecritureComptableService.getEcrituresByReference(reference);
        List<EcritureComptableDTO> ecrituresDTOs = ecritures.stream()
                .map(ecritureComptableMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ecrituresDTOs);
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<EcritureComptableDTO>> getEcrituresByStatut(@PathVariable Statut statut) {
        List<EcritureComptable> ecritures = ecritureComptableService.getEcrituresByStatut(statut);
        List<EcritureComptableDTO> ecrituresDTOs = ecritures.stream()
                .map(ecritureComptableMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ecrituresDTOs);
    }

    @GetMapping("/periode")
    public ResponseEntity<List<EcritureComptableDTO>> getEcrituresByPeriode(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateDebut,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date dateFin) {
        List<EcritureComptable> ecritures = ecritureComptableService.getEcrituresByPeriode(dateDebut, dateFin);
        List<EcritureComptableDTO> ecrituresDTOs = ecritures.stream()
                .map(ecritureComptableMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ecrituresDTOs);
    }

    @PostMapping
    public ResponseEntity<EcritureComptableDTO> createEcriture(
            @Valid @RequestBody EcritureComptableDTO ecritureDTO) {
        EcritureComptableDTO createdEcriture = ecritureComptableService.createEcriture(ecritureDTO);
        return new ResponseEntity<>(createdEcriture, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EcritureComptableDTO> updateEcriture(
            @PathVariable int id,
            @Valid @RequestBody EcritureComptableDTO ecritureDTO) {
        EcritureComptableDTO updatedEcriture = ecritureComptableService.updateEcriture(id, ecritureDTO);
        return ResponseEntity.ok(updatedEcriture);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEcriture(@PathVariable int id) {
        try{
            ecritureComptableService.deleteEcriture(id);
            return ResponseEntity.noContent().build();
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Erreur lors de la suppression d'écriture: " + e.getMessage()));
        }
    }
}