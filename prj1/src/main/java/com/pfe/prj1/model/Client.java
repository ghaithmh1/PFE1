package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "client")
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotEmpty(message = "Le nom du client ne peut pas être vide")
    @Column(name = "nomClient", nullable = false, length = 100)
    private String nom;

    @NotEmpty(message = "L'identifiant ne peut pas être vide")
    @Column(name = "identifiantClient", nullable = false, unique = true, length = 100)
    private String identifiant;

    @NotEmpty(message = "Le telephone ne peut pas être vide")
    @Column(name = "telClient", nullable = false, length = 100)
    private String tel;

    @Column(name = "faxClient")
    private String fax;

    @NotEmpty(message = "L'email ne peut pas être vide")
    @Email(message = "L'email doit être valide")
    @Column(name = "emailClient", nullable = false, unique = true, length = 100)
    private String email;

    @NotEmpty(message = "Le pays ne peut pas être vide")
    @Column(name = "paysClient", nullable = false, length = 100)
    private String pays;

    @NotEmpty(message = "L'adresse ne peut pas être vide")
    @Column(name = "adresseClient", nullable = false, length = 100)
    private String adresse;

    @NotEmpty(message = "Le code postal ne peut pas être vide")
    @Column(name = "codePostalClient", nullable = false, length = 100)
    private String codePostal;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    private Entreprise entreprise;

    @JsonManagedReference
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL)
    private List<Facture> factures;
}