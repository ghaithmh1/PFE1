package com.pfe.prj1.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUtilisateurDto {
    // Tous les champs sont optionnels
    private String nom;
    private String email;
    private String password;
}