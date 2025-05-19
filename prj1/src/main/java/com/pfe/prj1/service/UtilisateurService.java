package com.pfe.prj1.service;

import com.pfe.prj1.auth.AuthenticationRequest;
import com.pfe.prj1.auth.AuthenticationResponse;
import com.pfe.prj1.auth.RegisterRequest;
import com.pfe.prj1.config.JwtUtil;
import com.pfe.prj1.dto.UpdateUtilisateurDto;
import com.pfe.prj1.model.Account;
import com.pfe.prj1.model.Article;
import com.pfe.prj1.model.Role;
import com.pfe.prj1.model.Utilisateur;
import com.pfe.prj1.repository.AccountRepository;
import com.pfe.prj1.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;


    public AuthenticationResponse registerUtilisateur(RegisterRequest request) {
        // Validation des champs obligatoires
        if (request.getNom() == null || request.getNom().isEmpty()) {
            throw new IllegalArgumentException("Le nom est obligatoire");
        }

        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }

        // Validation du format de l'email avec regex
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!Pattern.matches(emailRegex, request.getEmail())) {
            throw new IllegalArgumentException("Format d'email invalide");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }

        // Vérification si l'utilisateur existe déjà
        if (utilisateurRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalStateException("Un utilisateur avec cet email existe déjà");
        }

        // Validation du mot de passe (exemple: au moins 8 caractères)
        if (request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 8 caractères");
        }

        // 1. Création automatique d'un nouveau compte
        Account nouveauCompte = Account.builder()
                .nom("Compte de " + request.getNom())  // Nom personnalisé
                .description("Compte créé automatiquement")
                .build();
        accountRepository.save(nouveauCompte);

        // 2. Création de l'utilisateur lié à ce compte
        var user = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .account(nouveauCompte)
                .build();
        utilisateurRepository.save(user);


        String jwtToken = jwtUtil.generateToken(user, nouveauCompte.getId());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .nom(user.getNom())
                .role(user.getRole().name())
                .accountId(nouveauCompte.getId())
                .build();
    }

    public AuthenticationResponse loginUtilisateur(AuthenticationRequest request) {
        // Validation des champs
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new IllegalArgumentException("L'email est obligatoire");
        }

        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!Pattern.matches(emailRegex, request.getEmail())) {
            throw new IllegalArgumentException("Format d'email invalide");
        }

        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire");
        }

        // Récupération de l'utilisateur
        var user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect"));

        // Vérification du mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        // Génération du token
        var jwtToken = jwtUtil.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getAuthorities()
                ),
                user.getAccount().getId() // Récupérer l'ID du compte
        );

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .nom(user.getNom())
                .role(user.getRole().name())
                .accountId(user.getAccount().getId())
                .build();
    }


    public Utilisateur getUtilisateurById(int id){
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur avec l'ID " + id + " non trouvé"));
    }


    public List<Utilisateur> getAllUsers() {
        return utilisateurRepository.findAll();
    }

    @Transactional
    public Utilisateur updateUtilisateur(int id, UpdateUtilisateurDto updateDto) {
        Utilisateur existingUser = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur avec l'ID " + id + " non trouvé"));

        // Mettre à jour seulement les champs fournis
        if (updateDto.getNom() != null) {
            existingUser.setNom(updateDto.getNom());
        }

        if (updateDto.getEmail() != null) {
            existingUser.setEmail(updateDto.getEmail());
        }

        if (updateDto.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(updateDto.getPassword()));
        }

        // Sauvegarder l'utilisateur mis à jour
        return utilisateurRepository.save(existingUser);
    }

    @Transactional
    public void deleteUtilisateur(int id) {
        boolean exists = utilisateurRepository.existsById((id));
        if(!exists){
            throw new RuntimeException("Un utilisateur avec cet id " + id + " n existe pas");
        }
        utilisateurRepository.deleteById(id);
    }
}
