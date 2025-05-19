package com.pfe.prj1.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Data
@Entity
@Table(name = "ecriture_details")
public class EcritureDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ecriture_reference", nullable = false)
    private String ecritureReference;

    @Column(name = "compte_num", nullable = false)
    private String compteNum;

    @Column(name = "compte_name", nullable = false)
    private String compteNom;

    @Column(name = "debit", nullable = false)
    private Double debit;

    @Column(name = "credit", nullable = false)
    private Double credit;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false)
    private Date createdAt = new Date();

    public String getCompteNom() {
        return compteNom;
    }

    public void setCompteNom(String compteNom) {
        this.compteNom = compteNom;
    } 
}