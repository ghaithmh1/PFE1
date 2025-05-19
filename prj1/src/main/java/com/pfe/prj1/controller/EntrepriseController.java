package com.pfe.prj1.controller;

import com.pfe.prj1.model.Entreprise;
import com.pfe.prj1.service.EntrepriseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/entreprises")
public class EntrepriseController {

    @Autowired
    private EntrepriseService entrepriseService;

    @GetMapping
    public List<Entreprise> getAllEntreprises() {
        return entrepriseService.getAllEntreprises();
    }

    @GetMapping("/{id}")
    public Optional<Entreprise> getEntrepriseById(@PathVariable int id) {
        return entrepriseService.getEntrepriseById(id);
    }

    @PostMapping
    public Entreprise createEntreprise(@RequestBody Entreprise entreprise) {
        return entrepriseService.createEntreprise(entreprise);
    }

    @PutMapping("/{id}")
    public Entreprise updateEntreprise(@PathVariable int id, @RequestBody Entreprise entrepriseDetails) {
        return entrepriseService.updateEntreprise(id, entrepriseDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteEntreprise(@PathVariable int id) {
        entrepriseService.deleteEntreprise(id);
    }
}
