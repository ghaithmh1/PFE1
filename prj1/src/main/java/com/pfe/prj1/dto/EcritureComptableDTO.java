package com.pfe.prj1.dto;

import com.pfe.prj1.model.Statut;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class EcritureComptableDTO {

    private Integer id;

    private String num;

    @NotBlank(message = "La référence ne peut pas être vide")
    private String reference;

    @NotNull(message = "Le statut ne peut pas être null")
    private Statut statut;

    @NotNull(message = "La date ne peut pas être null")
    private Date date;

    @NotEmpty(message = "L'écriture doit avoir au moins une ligne")
    @Valid
    private List<EcritureCompteDTO> lignes = new ArrayList<>();
}