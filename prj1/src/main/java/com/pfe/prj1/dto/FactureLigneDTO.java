package com.pfe.prj1.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FactureLigneDTO {
    private Long id;
    private Long compteId;
    private Long articleId;
    private int quantite;
    private BigDecimal prixUnitaire;
    private BigDecimal tvaRate;
}