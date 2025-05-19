package com.pfe.prj1.dto;

import lombok.Data;

@Data
public class FournisseurDTO {
    private String nom;
    private String identifiant;
    private String matriculeFiscale;
    private String tel;
    private String fax;
    private String email;
    private String pays;
    private String adresse;
    private String codePostal;
    private int accountId;
}