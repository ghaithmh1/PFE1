package com.pfe.prj1.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

public class CompteDTO {

    @Pattern(regexp = "^\\d+$", message = "Le numéro de compte ne doit contenir que des chiffres")
    private String numero;

    @NotEmpty(message = "Le nom du compte ne peut pas être vide")
    private String nom;

    private Long classeId;
    private Long parentId;

    // Getters et Setters
    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Long getClasseId() {
        return classeId;
    }

    public void setClasseId(Long classeId) {
        this.classeId = classeId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}