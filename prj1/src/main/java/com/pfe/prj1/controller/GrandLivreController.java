package com.pfe.prj1.controller;

import com.pfe.prj1.model.GrandLivre;
import com.pfe.prj1.service.GrandLivreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/grand-livre")
public class GrandLivreController {
    private final GrandLivreService grandLivreService;

    @Autowired
    public GrandLivreController(GrandLivreService grandLivreService) {
        this.grandLivreService = grandLivreService;
    }

    @GetMapping
    public ResponseEntity<List<GrandLivre>> getAllEntries() {
        return ResponseEntity.ok(grandLivreService.getAllEntries());
    }

    @PostMapping("/ecriture")
    public ResponseEntity<GrandLivre> createEcritureEntry(
            @RequestParam String ecritureRef,
            @RequestParam String compteNom,
            @RequestParam String compteNum,
            @RequestParam Double debit,
            @RequestParam Double credit,
            @RequestParam Date createdAt) {
        GrandLivre entry = grandLivreService.saveEcritureDetails(
                ecritureRef, compteNom, compteNum, debit, credit, createdAt);
        return ResponseEntity.ok(entry);
    }
}