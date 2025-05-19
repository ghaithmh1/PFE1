package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Entity
@Table(name = "grand_livre")
@Getter @Setter
public class GrandLivre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id")
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Facture facture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_ligne_id")
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    private FactureLigne ligne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_id")
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Compte compte;

    private String reference;
    private String clientName;
    private String fournisseurName;
    private String articleName;
    private String compteName;
    private String compteNumero;
    
    @Column(precision = 19, scale = 3)
    private BigDecimal credit = BigDecimal.ZERO;

    @Column(precision = 19, scale = 3)
    private BigDecimal debit = BigDecimal.ZERO;

    private LocalDateTime dateEcriture;

    @PrePersist
    protected void onPrePersist() {
        if (this.dateEcriture == null) {
            this.dateEcriture = LocalDateTime.now();
        }
        if (facture != null || ligne != null) {
            populateFromRelations();
        }
    }

    public void populateFromRelations() {
        if (facture != null) {
            this.reference = facture.getReference();
            if (facture.getClient() != null) {
                this.clientName = facture.getClient().getNom();
            }
            if (facture.getFournisseur() != null) {
                this.fournisseurName = facture.getFournisseur().getNom();
            }
        }

        if (ligne != null) {
            this.articleName = ligne.getArticle() != null ? 
                ligne.getArticle().getDesignation() : "N/A";
            
            if (ligne.getCompte() != null) {
                this.compteName = ligne.getCompte().getNom();
                this.compteNumero = ligne.getCompte().getNumero();
            }
            
            if (facture != null) {
                BigDecimal amount = ligne.getPrixUnitaire()
                    .multiply(BigDecimal.valueOf(ligne.getQuantite()));
                
                if (facture.getClient() != null) {
                    this.credit = amount;
                } else if (facture.getFournisseur() != null) {
                    this.debit = amount;
                }
            }
        }
    }

    public void populateFromEcritureDetails(String ecritureRef, String compteNom, 
                                          String compteNum, Double debit, 
                                          Double credit, Date createdAt) {
        this.reference = ecritureRef;
        this.compteName = compteNom;
        this.compteNumero = compteNum;
        this.debit = BigDecimal.valueOf(debit);
        this.credit = BigDecimal.valueOf(credit);
        this.dateEcriture = createdAt.toInstant()
                                  .atZone(ZoneId.systemDefault())
                                  .toLocalDateTime();
    }
}