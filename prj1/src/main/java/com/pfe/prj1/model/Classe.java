package com.pfe.prj1.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "classe")
public class Classe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero", length = 10, nullable = false)
    private String numero;

    @NotBlank(message = "Le nom de la classe ne peut pas être vide")
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "plan_comptable_id")
    private PlanComptable planComptable;

    @JsonManagedReference
    @OneToMany(mappedBy = "classe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Compte> comptes = new ArrayList<>();




    // Constructeurs
    public Classe() {}

    public Classe(String numero, String nom) {
        this.numero = numero;
        this.nom = nom;
    }
}