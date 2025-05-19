package com.pfe.prj1.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class FactureDTO {
    private Long id;
    private String reference;
    private Long clientId;
    private Long fournisseurId;
    private String paymentMethod;
    private String currency;
    private BigDecimal discount;
    private boolean paid;
    private String comment;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date issueDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date paymentDate;

    private List<FactureLigneDTO> lignes;
    private BigDecimal totalHT;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;
}