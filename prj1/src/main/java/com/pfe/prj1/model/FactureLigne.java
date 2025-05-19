package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facture_lignes")
@Getter @Setter
public class FactureLigne {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_id", nullable = false)
    @JsonBackReference(value = "compte-facturelignes")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Compte compte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    @JsonBackReference
    private Article article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id", nullable = false)
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Facture facture;

    @OneToMany(mappedBy = "ligne", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrandLivre> grandLivreEntries = new ArrayList<>();

    private int quantite;
    private BigDecimal tvaRate;
    private String designation;
    private BigDecimal prixUnitaire;

    @PreRemove
    private void preRemove() {
        // Nettoyer les références avant la suppression
        grandLivreEntries.clear();
    }
}