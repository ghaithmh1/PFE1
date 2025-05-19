package com.pfe.prj1.controller;

import com.pfe.prj1.service.PlanComptableTunisienImporter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    @Autowired
    private PlanComptableTunisienImporter importer;

    @PostMapping("/plan-comptable-tunisien")
    public ResponseEntity<?> importPlanComptableTunisien(@RequestParam("filePath") String filePath) {
        try {
            importer.importPlanComptableTunisien(filePath);
            return ResponseEntity.ok("Plan comptable tunisien importé avec succès");
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Erreur lors de l'importation: " + e.getMessage());
        }
    }

}