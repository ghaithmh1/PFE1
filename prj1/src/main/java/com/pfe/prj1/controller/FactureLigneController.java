package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.model.FactureLigne;
import com.pfe.prj1.service.FactureLigneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/facture-lignes")
@RequiredArgsConstructor
public class FactureLigneController {

    private final FactureLigneService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FactureLigne>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>("Liste des lignes de facture", service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FactureLigne>> getOne(@PathVariable Long id) {
        return service.findById(id)
                .map(l -> ResponseEntity.ok(new ApiResponse<>("Ligne trouvée", l)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FactureLigne>> create(@RequestBody FactureLigne ligne) {
        return ResponseEntity.ok(new ApiResponse<>("Ligne créée", service.save(ligne)));
    }

    @PutMapping("/{id}")
public ResponseEntity<ApiResponse<FactureLigne>> update(@PathVariable Long id, @RequestBody FactureLigne updatedLigne) {
    return service.update(id, updatedLigne)
            .map(ligne -> ResponseEntity.ok(new ApiResponse<>("Ligne mise à jour", ligne)))
            .orElse(ResponseEntity.notFound().build());
}


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(new ApiResponse<>("Ligne supprimée"));
    }
}
