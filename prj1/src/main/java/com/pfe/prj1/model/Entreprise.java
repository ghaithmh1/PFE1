package com.pfe.prj1.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "entreprise")
public class Entreprise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String uuid;
    private Date dateCreated;
    private Date dateUpdated;
    private int version;
    
    @NotEmpty(message = "Le nom de l'entreprise ne peut pas être vide")
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;
    
    private String no;
    private String rib2;
    private String rib3;
    private boolean active;
    private String adresse;
    private boolean avecSansSignature;
    private String codePostal;
    private String fax;
    private String footer;
    private String loginDigigo;
    private String loginTTN;
    private String logo;
    private String mail;
    private String matriculeFiscale;
    private String patente;
    private String pays;
    private String pwdDigigo;
    private String pwdTTN;
    private String registreCommerce;
    private String rue;
    private String service;
    private String tel;
    private String templateSpecifique;
    private String type;
    private String ville;
    private String devise;
    private int idPays;
    private boolean showCodeBarre;

    @OneToMany(mappedBy = "entreprise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Utilisateur> utilisateurs = new ArrayList<>();

    public Entreprise() {
        this.uuid = UUID.randomUUID().toString();
        this.dateCreated = new Date();
        this.dateUpdated = new Date();
        this.version = 1;
    }

    public Entreprise(String nom) {
        this();
        this.nom = nom;
    }

    public void ajouterUtilisateur(Utilisateur utilisateur) {
        utilisateurs.add(utilisateur);
        utilisateur.setEntreprise(this);
    }

    public void supprimerUtilisateur(Utilisateur utilisateur) {
        utilisateurs.remove(utilisateur);
        utilisateur.setEntreprise(null);
    }
}