package com.pfe.prj1.controller;

import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.CompteDTO;
import com.pfe.prj1.dto.CompteResponseDTO;
import com.pfe.prj1.mapper.CompteMapper;
import com.pfe.prj1.repository.CompteRepository;
import com.pfe.prj1.service.CompteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/compte")
public class CompteController {

    @Autowired
    private CompteService compteService;

    @Autowired
    private CompteRepository compteRepository;

    @Autowired
    private CompteMapper compteMapper;

    @GetMapping("/byClasse/{classeId}")
    public ResponseEntity<List<CompteResponseDTO>> getComptesByClasse(@PathVariable Long classeId) {
        return ResponseEntity.ok(
                compteRepository.findByClasseId(classeId).stream()
                        .map(compteMapper::toResponseDTO)
                        .collect(Collectors.toList())
        );
    }


    @GetMapping
    public ResponseEntity<List<CompteResponseDTO>> getAllComptes() {
        return ResponseEntity.ok(
                compteService.getAllComptes().stream()
                        .map(compteMapper::toResponseDTO)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompteResponseDTO> getCompteById(@PathVariable Long id) {
        return ResponseEntity.ok(
                compteMapper.toResponseDTO(compteService.getCompteById(id))
        );
    }

    @PostMapping
    public ResponseEntity<CompteResponseDTO> createCompte(
            @Valid @RequestBody CompteDTO compteDTO,
            @RequestParam(required = false) Long parentId) {
        return new ResponseEntity<>(
                compteMapper.toResponseDTO(compteService.createCompte(compteMapper.toEntity(compteDTO), parentId)),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompteResponseDTO> updateCompte(
            @PathVariable Long id,
            @Valid @RequestBody CompteDTO compteDTO) {
        return ResponseEntity.ok(
                compteMapper.toResponseDTO(compteService.updateCompte(id, compteMapper.toEntity(compteDTO)))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCompte(@PathVariable Long id) {
        try {
            boolean deleted = compteService.deleteCompte(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Erreur lors de la suppression du compte: " + e.getMessage()));
        }
    }
}