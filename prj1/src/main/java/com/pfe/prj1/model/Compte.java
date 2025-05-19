package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "compte")
public class Compte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero", length = 20, nullable = false)
    private String numero;

    @NotEmpty(message = "Le nom du compte ne peut pas être vide")
    @Column(name = "nom", nullable = false, length = 500)
    private String nom;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Compte parent;

    @JsonManagedReference(value = "compte-factures")
    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Facture> factures = new ArrayList<>();

    @JsonManagedReference(value = "compte-ecritures")
    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EcritureCompte> ecritureComptes = new ArrayList<>();

    @JsonManagedReference(value = "compte-facturelignes")
    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FactureLigne> factureLignes = new ArrayList<>();

    @JsonManagedReference(value = "compte-grandlivre")
    @OneToMany(mappedBy = "compte", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrandLivre> grandLivreEntries = new ArrayList<>();

    // Constructeurs
    public Compte() {}

    public Compte(String numero, String nom) {
        this.numero = numero;
        this.nom = nom;
    }

    public String getNumero() {
        return this.numero;
    }
    public String getNom() {
        return this.nom;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }
    public void setNom(String nom) {
        this.nom = nom;
    }

    @PreRemove
    private void preRemove() {
        // Nettoyer les références avant la suppression
        grandLivreEntries.clear();
    }
}