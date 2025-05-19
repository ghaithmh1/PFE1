package com.pfe.prj1.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class EcritureCompteDTO {

    private Integer id;

    @NotBlank(message = "La description ne peut pas être vide")
    private String description;

    @NotNull(message = "Le débit ne peut pas être null")
    @PositiveOrZero(message = "Le débit doit être positif ou zéro")
    private Double debit = 0.0;

    @NotNull(message = "Le crédit ne peut pas être null")
    @PositiveOrZero(message = "Le crédit doit être positif ou zéro")
    private Double credit = 0.0;

    @NotNull(message = "Le compte ne peut pas être null")
    private CompteRefDTO compte;
}