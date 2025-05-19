package com.pfe.prj1.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "article")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotEmpty(message = "La designation de l'article ne peut pas être vide")
    @Column(name = "designation", nullable = false, length = 100)
    private String designation;

    @NotEmpty(message = "La reference ne peut pas être vide")
    @Column(name = "referenceArticle", nullable = false, unique = true, length = 100)
    private String reference;

    @NotEmpty(message = "La description ne peut pas être vide")
    @Column(name = "descriptionArticle", nullable = false, length = 250)
    private String description;

    @NotNull(message = "Le TVA ne peut pas être vide")
    @Enumerated(EnumType.STRING) // Pour stocker la valeur de l'énumération sous forme de chaîne dans la base de données
    @Column(name = "TVAArticle", nullable = false)
    private TVA TVA;

    @NotNull(message = "Le prix de vente ne peut pas être vide")
    @Column(name = "prixVente", nullable = false)
    private double prixVente;

    @NotNull(message = "Le prix d'achat ne peut pas être vide")
    @Column(name = "prixAchat", nullable = false)
    private double prixAchat;

    @NotEmpty(message = "La note ne peut pas être vide")
    @Column(name = "noteArticle", nullable = false, length = 100)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @JsonBackReference
    private Account account;

    @OneToMany(mappedBy = "article", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<FactureLigne> lignes = new ArrayList<>();

    public enum TVA {
        TVA_19,
        TVA_13,
        TVA_7,
        TVA_0
    }

    
   
}