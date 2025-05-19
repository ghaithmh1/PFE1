package com.pfe.prj1.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ArticleDTO {
    @NotEmpty(message = "La designation ne peut pas être vide")
    private String designation;

    @NotEmpty(message = "La reference ne peut pas être vide")
    private String reference;

    @NotEmpty(message = "La description ne peut pas être vide")
    private String description;

    @NotEmpty(message = "Le TVA ne peut pas être vide")
    private String TVA;

    @NotNull(message = "Le prix de vente ne peut pas être vide")
    @Positive(message = "Le prix de vente doit être positif")
    private Double prixVente;

    @NotNull(message = "Le prix d'achat ne peut pas être vide")
    @Positive(message = "Le prix d'achat doit être positif")
    private Double prixAchat;

    @NotEmpty(message = "La note ne peut pas être vide")
    private String note;

    @NotNull(message = "L'ID du compte est obligatoire")
    private int accountId;
}