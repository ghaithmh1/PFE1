package com.pfe.prj1.controller;

import com.pfe.prj1.auth.AuthenticationRequest;
import com.pfe.prj1.auth.AuthenticationResponse;
import com.pfe.prj1.auth.RegisterRequest;
import com.pfe.prj1.config.JwtUtil;
import com.pfe.prj1.dto.ApiResponse;
import com.pfe.prj1.dto.UpdateUtilisateurDto;
import com.pfe.prj1.model.Article;
import com.pfe.prj1.model.Utilisateur;
import com.pfe.prj1.service.UtilisateurService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin(origins = "http://localhost:5173") // Permet les requêtes depuis le frontend React
public class UtilisateurController {

    @Autowired
    private UtilisateurService utilisateurService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(utilisateurService.registerUtilisateur(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> loginUtilisateur(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(utilisateurService.loginUtilisateur(request));
    }
    @GetMapping
    public ResponseEntity<ApiResponse> getUtilisateur() {
        List<Utilisateur> utilisateurs = utilisateurService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse("Liste des utilisateurs récupérée avec succès", utilisateurs));
    }


    @GetMapping("profile/{id}")
    public ResponseEntity<ApiResponse> getUtilisateurById(@PathVariable int id) {
        try{
            Utilisateur utilisateur = utilisateurService.getUtilisateurById(id);
            return ResponseEntity.ok(new ApiResponse("Utilisateur récupéré avec succès", utilisateur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }

    }

    @PutMapping("profile/{id}")
    public ResponseEntity<ApiResponse> updateUtilisateur(@PathVariable int id, @Valid @RequestBody UpdateUtilisateurDto utilisateur) {
        try {
            utilisateurService.updateUtilisateur(id, utilisateur);
            return ResponseEntity.ok(new ApiResponse("Utilisateur mis à jour avec succès", utilisateur));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/profile/{id}")
    public ResponseEntity<ApiResponse> deleteUtilisateur(@PathVariable int id) {
        try {
            utilisateurService.deleteUtilisateur(id);
            return ResponseEntity.ok(new ApiResponse("Utilisateur avec l'ID " + id + " a été supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse(e.getMessage()));
        }
    }

}