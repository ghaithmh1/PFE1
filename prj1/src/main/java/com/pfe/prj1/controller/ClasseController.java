package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.model.Classe;
import com.pfe.prj1.service.ClasseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/classe")
public class ClasseController {
    @Autowired
    private ClasseService classeService;

    @GetMapping
    public List<Classe> getAllClasses() {
        return classeService.getAllClasses();
    }

    @GetMapping("/{classeId}")
    public ResponseEntity<ApiResponse> getClasseById(@PathVariable("classeId") int classeId) {
        try {
            Classe classe = classeService.getClasseById(classeId);
            return ResponseEntity.ok(new ApiResponse("Classe récupérée avec succès", classe));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createClasse(@Valid @RequestBody Classe classe) {
        try {
            classeService.saveClasse(classe);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse("Classe créée avec succès", classe));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping("/{classeId}")
    public ResponseEntity<ApiResponse> updateClasse(@PathVariable("classeId") int classeId, @Valid @RequestBody Classe classe) {
        try {
            Classe updatedClasse = classeService.updateClasse(classeId, classe);
            return ResponseEntity.ok(new ApiResponse("Classe mise à jour avec succès", updatedClasse));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{classeId}")
    public ResponseEntity<ApiResponse> deleteClasse(@PathVariable("classeId") int classeId) {
        try {
            classeService.deleteClasse(classeId);
            return ResponseEntity.ok(new ApiResponse("Classe supprimée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }
}