package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.FournisseurDTO;
import com.pfe.prj1.model.Fournisseur;
import com.pfe.prj1.service.FournisseurService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fournisseurs")
public class FournisseurController {
    @Autowired
    private FournisseurService fournisseurService;

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getByAccount(@PathVariable int accountId) {
        return ResponseEntity.ok(fournisseurService.getAllFournisseursByAccountId(accountId));
    }

    @GetMapping("/{fournisseurId}/account/{accountId}")
    public ResponseEntity<ApiResponse> getFournisseurById(@PathVariable int fournisseurId,
                                                          @PathVariable int accountId) {
        try {
            Fournisseur fournisseur = fournisseurService.getFournisseurByIdAndAccount(fournisseurId, accountId);
            return ResponseEntity.ok(new ApiResponse("Fournisseur récupéré avec succès", fournisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createFournisseur(@Valid @RequestBody FournisseurDTO fournisseurDTO) {
        try {
            Fournisseur fournisseur = fournisseurService.convertDtoToEntity(fournisseurDTO);
            Fournisseur savedFournisseur = fournisseurService.saveFournisseur(fournisseur, fournisseurDTO.getAccountId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse("Fournisseur créé avec succès", savedFournisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{fournisseurId}/account/{accountId}")
    public ResponseEntity<ApiResponse> updateFournisseur(@PathVariable int fournisseurId,
                                                         @PathVariable int accountId,
                                                         @Valid @RequestBody Fournisseur fournisseur) {
        try {
            Fournisseur updatedFournisseur = fournisseurService.updateFournisseur(fournisseurId, fournisseur, accountId);
            return ResponseEntity.ok(new ApiResponse("Fournisseur mis à jour avec succès", updatedFournisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{fournisseurId}/account/{accountId}")
    public ResponseEntity<ApiResponse> deleteFournisseur(@PathVariable int fournisseurId,
                                                         @PathVariable int accountId) {
        try {
            fournisseurService.deleteFournisseur(fournisseurId, accountId);
            return ResponseEntity.ok(new ApiResponse("Fournisseur supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }
}