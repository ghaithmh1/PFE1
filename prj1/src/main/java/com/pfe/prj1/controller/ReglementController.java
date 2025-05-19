package com.pfe.prj1.controller;

import com.pfe.prj1.model.Reglement;
import com.pfe.prj1.service.ReglementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reglements")
public class ReglementController {

    @Autowired
    private ReglementService reglementService;

    @GetMapping
    public List<Reglement> getAllReglements() {
        return reglementService.getAllReglements();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reglement> getReglementById(@PathVariable int id) {
        return reglementService.getReglementById(id)
                .map(reglement -> new ResponseEntity<>(reglement, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reglement createReglement(@RequestBody Reglement reglement) {
        return reglementService.createReglement(reglement);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reglement> updateReglement(@PathVariable int id, @RequestBody Reglement reglementDetails) {
        Reglement updatedReglement = reglementService.updateReglement(id, reglementDetails);
        return updatedReglement != null
                ? new ResponseEntity<>(updatedReglement, HttpStatus.OK)
                : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteReglement(@PathVariable int id) {
        reglementService.deleteReglement(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
