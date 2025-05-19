package com.pfe.prj1.dto;

import lombok.Data;

@Data
public class CompteRefDTO {

    private Long id;
    private String numero;
    private String nom;

    // Constructeur vide nécessaire pour la désérialisation
    public CompteRefDTO() {}

    // Constructeur pratique avec id seulement
    public CompteRefDTO(Long id) {
        this.id = id;
    }

    // Constructeur complet
    public CompteRefDTO(Long id, String numero, String nom) {
        this.id = id;
        this.numero = numero;
        this.nom = nom;
    }
}