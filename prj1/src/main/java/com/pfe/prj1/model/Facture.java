package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "factures")
@Getter @Setter
public class Facture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String reference;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fournisseur_id")
    private Fournisseur fournisseur;

    @JsonBackReference(value = "compte-factures")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compte_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Compte compte;

    @JsonManagedReference
    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FactureLigne> lignes = new ArrayList<>();

    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GrandLivre> grandLivreEntries = new ArrayList<>();

    @Column(precision = 19, scale = 3)
    private BigDecimal totalHT = BigDecimal.ZERO;

    @Column(precision = 19, scale = 3)
    private BigDecimal totalTVA = BigDecimal.ZERO;

    @Column(precision = 19, scale = 3)
    private BigDecimal totalTTC = BigDecimal.ZERO;

    private String paymentMethod;
    private String currency = "TND";
    private BigDecimal discount = BigDecimal.ZERO;
    private boolean paid = false;
    private String comment;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date issueDate;

    @Temporal(TemporalType.DATE)
    private Date paymentDate;

    @Version
    private Long version;

    @PrePersist
    protected void onPrePersist() {
        if (this.reference == null) {
            this.reference = "TEMP-" + UUID.randomUUID();
        }
        if (this.issueDate == null) {
            this.issueDate = new Date();
        }
        validateClientOrFournisseur();
    }

    @PostPersist
    protected void onPostPersist() {
        if (this.reference.startsWith("TEMP-")) {
            this.reference = String.format("FACT-%06d", this.id);
        }
    }

    @PreUpdate
    protected void onPreUpdate() {
        validateClientOrFournisseur();
    }

    private void validateClientOrFournisseur() {
        boolean hasClient = client != null;
        boolean hasFournisseur = fournisseur != null;
        if (!(hasClient ^ hasFournisseur)) {
            throw new IllegalStateException("Invoice must be associated with either a client or a supplier, not both nor none.");
        }
    }

    public void addLigne(FactureLigne ligne) {
        lignes.add(ligne);
        ligne.setFacture(this);
        calculateTotals();
    }

    public void calculateTotals() {
        this.totalHT = lignes.stream()
                .map(l -> l.getPrixUnitaire().multiply(BigDecimal.valueOf(l.getQuantite())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalTVA = lignes.stream()
                .map(l -> l.getPrixUnitaire()
                        .multiply(BigDecimal.valueOf(l.getQuantite()))
                        .multiply(l.getTvaRate().divide(BigDecimal.valueOf(100))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.totalTTC = totalHT.add(totalTVA);
    }

    @PreRemove
    private void preRemove() {
        grandLivreEntries.clear();
    }
}