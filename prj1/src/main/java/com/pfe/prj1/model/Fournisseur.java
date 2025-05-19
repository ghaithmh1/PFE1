package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "fournisseur")
public class Fournisseur {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotEmpty(message = "Le nom du fournisseur ne peut pas être vide")
    @Column(name = "nomFournisseur", nullable = false, length = 100)
    private String nom;

    @NotEmpty(message = "L'identifiant ne peut pas être vide")
    @Column(name = "identifiantFournisseur", nullable = false, length = 100)
    private String identifiant;

    @NotEmpty(message = "Le matricule fiscal ne peut pas être vide")
    @Column(name = "matricule_fiscale", nullable = false, length = 100)
    private String matriculeFiscale;

    @NotEmpty(message = "Le telephone ne peut pas être vide")
    @Column(name = "telFournisseur", nullable = false, length = 100)
    private String tel;

    @Column(name = "faxFournisseur")
    private String fax;

    @NotEmpty(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit être valide")
    @Column(name = "emailFournisseur", nullable = false, length = 100)
    private String email;

    @NotEmpty(message = "Le pays ne peut pas être vide")
    @Column(name = "paysFournisseur", nullable = false, length = 100)
    private String pays;

    @NotEmpty(message = "L'adresse ne peut pas être vide")
    @Column(name = "adresseFournisseur", nullable = false, length = 100)
    private String adresse;

    @NotEmpty(message = "Le code postal ne peut pas être vide")
    @Column(name = "codePostalFournisseur", nullable = false, length = 100)
    private String codePostal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account;

    @JsonManagedReference
    @OneToMany(mappedBy = "fournisseur", cascade = CascadeType.ALL)
    private List<Facture> factures ;
}