package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.model.PlanComptable;
import com.pfe.prj1.service.ImportPlanComptableService;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/plan-comptable")
public class PlanComptableImportController {

    @Autowired
    private ImportPlanComptableService importPlanComptableService;

    /**
     * Endpoint pour importer un plan comptable depuis un fichier Excel
     */
    @PostMapping("/import")
    public ResponseEntity<ApiResponse> importPlanComptable(
            @RequestParam("file") MultipartFile file,
            @RequestParam("nom") @NotEmpty String nom) {

        try {
            // Vérifier le type de fichier
            if (!isExcelFile(file)) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse("Le fichier doit être au format Excel (.xlsx ou .xls)"));
            }

            // Importer le plan comptable
            PlanComptable planComptable = importPlanComptableService.importPlanComptable(file, nom);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponse("Plan comptable importé avec succès", planComptable));

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Erreur lors de l'importation du plan comptable: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse("Erreur lors de l'importation du plan comptable: " + e.getMessage()));
        }
    }

    /**
     * Vérifie si le fichier est un fichier Excel
     */
    private boolean isExcelFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return false;
        }

        return originalFilename.endsWith(".xlsx") || originalFilename.endsWith(".xls");
    }
}