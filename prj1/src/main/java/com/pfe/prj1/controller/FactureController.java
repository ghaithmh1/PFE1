package com.pfe.prj1.controller;

import com.pfe.prj1.dto.FactureDTO;
import com.pfe.prj1.model.Facture;
import com.pfe.prj1.service.FactureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/factures")
public class FactureController {
    private final FactureService factureService;

    public FactureController(FactureService factureService) {
        this.factureService = factureService;
    }

    @PostMapping
    public ResponseEntity<FactureDTO> createFacture(@RequestBody FactureDTO factureDTO) {
        FactureDTO createdFacture = factureService.createFacture(factureDTO);
        return new ResponseEntity<>(createdFacture, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactureDTO> getFactureById(@PathVariable Long id) {
        FactureDTO facture = factureService.getFactureById(id);
        return ResponseEntity.ok(facture);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Facture>> getFactureByClient(@PathVariable int clientId) {
        return ResponseEntity.ok(factureService.getFactureByClient(clientId));
    }

    @GetMapping("/fournisseur/{fournisseurId}")
    public ResponseEntity<List<Facture>> getFactureByFournisseur(@PathVariable int fournisseurId) {
        return ResponseEntity.ok(factureService.getFactureByFournisseur(fournisseurId));
    }

    @GetMapping
    public ResponseEntity<List<FactureDTO>> getAllFactures() {
        List<FactureDTO> factures = factureService.getAllFactures();
        return ResponseEntity.ok(factures);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FactureDTO> updateFacture(@PathVariable Long id, @RequestBody FactureDTO factureDTO) {
        FactureDTO updatedFacture = factureService.updateFacture(id, factureDTO);
        return ResponseEntity.ok(updatedFacture);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacture(@PathVariable Long id) {
        factureService.deleteFacture(id);
        return ResponseEntity.noContent().build();
    }

}