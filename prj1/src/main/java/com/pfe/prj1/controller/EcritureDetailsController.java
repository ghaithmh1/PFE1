package com.pfe.prj1.controller;

import com.pfe.prj1.model.EcritureDetails;
import com.pfe.prj1.repository.EcritureDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ecriture-details")
public class EcritureDetailsController {

    private final EcritureDetailsRepository ecritureDetailsRepository;

    @Autowired
    public EcritureDetailsController(EcritureDetailsRepository ecritureDetailsRepository) {
        this.ecritureDetailsRepository = ecritureDetailsRepository;
    }

    @GetMapping
    public ResponseEntity<List<EcritureDetails>> getAllEcritureDetails() {
        return ResponseEntity.ok(ecritureDetailsRepository.findAll());
    }
}