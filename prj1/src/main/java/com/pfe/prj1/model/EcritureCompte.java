package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "rl_compte_ecriture")
public class EcritureCompte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "debit", nullable = false)
    private Double debit = 0.0;

    @Column(name = "credit", nullable = false)
    private Double credit = 0.0;

    @ManyToOne
    @JoinColumn(name = "ecriture_comptable_id", nullable = false)
    @JsonBackReference
    private EcritureComptable ecritureComptable;

    @ManyToOne
    @JoinColumn(name = "compte_id")
    @JsonBackReference(value = "compte-ecritures")
    private Compte compte;
}