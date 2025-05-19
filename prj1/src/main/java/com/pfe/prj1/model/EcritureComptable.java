package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "ecriture_comptable")
public class EcritureComptable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "num", nullable = false)
    private String num;

    @Column(name = "reference", nullable = false, length = 100)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 50)
    private Statut statut;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date date;

    @OneToMany(mappedBy = "ecritureComptable", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<EcritureCompte> lignes = new ArrayList<>();


    // Constructeurs
    public EcritureComptable() {}

    public EcritureComptable(String num, String reference, Statut statut, Date date, float montant) {
        this.num = num;
        this.reference = reference;
        this.statut = statut;
        this.date = date;
    }

    public void ajouterLigne(EcritureCompte ligne) {
        lignes.add(ligne);
        ligne.setEcritureComptable(this);
    }

    // Nouvelle méthode - total des débits
    public Double getTotalDebit() {
        return lignes.stream()
                .mapToDouble(EcritureCompte::getDebit)
                .sum();
    }

    // Nouvelle méthode - total des crédits
    public Double getTotalCredit() {
        return lignes.stream()
                .mapToDouble(EcritureCompte::getCredit)
                .sum();
    }

    @JsonProperty("montantAbsolu")
    public Double getMontantAbsolu() {
        return Math.max(getTotalDebit(), getTotalCredit());
    }

    public boolean estEquilibre() {
        // Une écriture est équilibrée si la somme des crédits = somme des débits
        double totalCredit = lignes.stream().mapToDouble(EcritureCompte::getCredit).sum();
        double totalDebit = lignes.stream().mapToDouble(EcritureCompte::getDebit).sum();

        // Utilisation d'une petite marge d'erreur pour les calculs en virgule flottante
        return Math.abs(totalCredit - totalDebit) < 0.001;
    }
}