package com.pfe.prj1.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
public class Reglement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_reglement")
    private Date dateReglement;

    @Column(name = "mode_paiement")
    private String modePaiement;

    @Column(name = "montant")
    private float montant;

    @Column(name = "numero_avoir")
    private String numeroAvoir;

    @Column(name = "numero_cheque")
    private String numeroCheque;

    @Column(name = "ref_virement")
    private String refVirement;

    @ManyToOne
    @JoinColumn(name = "facture_id", referencedColumnName = "id")
    private Facture facture;

    @Column(name = "reglement_facture")
    private boolean reglementFacture;

    @Column(name = "banque_nom")
    private String banqueNom;
}
