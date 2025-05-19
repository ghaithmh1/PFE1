package com.pfe.prj1.service;

import com.pfe.prj1.dto.FactureDTO;
import com.pfe.prj1.dto.FactureLigneDTO;
import com.pfe.prj1.model.*;
import com.pfe.prj1.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FactureService {
    private final FactureRepository factureRepository;
    private final ClientRepository clientRepository;
    private final FournisseurRepository fournisseurRepository;
    private final CompteRepository compteRepository;
    private final ArticleRepository articleRepository;
    private final GrandLivreRepository grandLivreRepository;

    @Transactional
    public FactureDTO createFacture(FactureDTO factureDTO) {
        validateClientAndFournisseurIds(factureDTO);
        validateFactureLignes(factureDTO.getLignes());

        Facture facture = new Facture();

        // Set client or fournisseur
        if (factureDTO.getClientId() != null) {
            Client client = clientRepository.findById(factureDTO.getClientId().intValue())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            facture.setClient(client);
        } else {
            Fournisseur fournisseur = fournisseurRepository.findById(factureDTO.getFournisseurId().intValue())
                    .orElseThrow(() -> new IllegalArgumentException("Fournisseur not found"));
            facture.setFournisseur(fournisseur);
        }

        // Set basic fields
        facture.setPaymentMethod(factureDTO.getPaymentMethod());
        facture.setCurrency(factureDTO.getCurrency() != null ? factureDTO.getCurrency() : "TND");
        facture.setDiscount(factureDTO.getDiscount() != null ? factureDTO.getDiscount() : BigDecimal.ZERO);
        facture.setPaid(factureDTO.isPaid());
        facture.setComment(factureDTO.getComment());
        facture.setIssueDate(factureDTO.getIssueDate() != null ? factureDTO.getIssueDate() : new Date());
        facture.setPaymentDate(factureDTO.getPaymentDate());

        // Process lines
        for (FactureLigneDTO ligneDTO : factureDTO.getLignes()) {
            FactureLigne ligne = createFactureLigne(ligneDTO);
            facture.addLigne(ligne);
        }

        facture.calculateTotals();
        Facture savedFacture = factureRepository.save(facture);

        // Create GrandLivre entries
        createGrandLivreEntries(savedFacture);

        return convertToDTO(savedFacture);
    }

    private FactureLigne createFactureLigne(FactureLigneDTO ligneDTO) {
        FactureLigne ligne = new FactureLigne();

        Compte compte = compteRepository.findById(ligneDTO.getCompteId())
                .orElseThrow(() -> new IllegalArgumentException("Compte not found"));
        ligne.setCompte(compte);

        Article article = articleRepository.findById(ligneDTO.getArticleId().intValue())
                .orElseThrow(() -> new IllegalArgumentException("Article not found"));
        ligne.setArticle(article);

        ligne.setQuantite(ligneDTO.getQuantite());
        ligne.setPrixUnitaire(ligneDTO.getPrixUnitaire());
        ligne.setTvaRate(ligneDTO.getTvaRate() != null ? ligneDTO.getTvaRate() : BigDecimal.ZERO);

        return ligne;
    }

    private void createGrandLivreEntries(Facture facture) {
        for (FactureLigne ligne : facture.getLignes()) {
            GrandLivre entry = new GrandLivre();
            entry.setFacture(facture);
            entry.setLigne(ligne);
            entry.populateFromRelations();

            // Ensure no null values
            if (entry.getClientName() == null) entry.setClientName("-");
            if (entry.getFournisseurName() == null) entry.setFournisseurName("-");
            if (entry.getCredit() == null) entry.setCredit(BigDecimal.ZERO);
            if (entry.getDebit() == null) entry.setDebit(BigDecimal.ZERO);

            grandLivreRepository.save(entry);
        }
    }

    private void validateClientAndFournisseurIds(FactureDTO dto) {
        if (dto.getClientId() == null && dto.getFournisseurId() == null) {
            throw new IllegalArgumentException("Either clientId or fournisseurId must be provided.");
        }
        if (dto.getClientId() != null && dto.getFournisseurId() != null) {
            throw new IllegalArgumentException("Cannot provide both clientId and fournisseurId.");
        }
    }

    private void validateFactureLignes(List<FactureLigneDTO> lignes) {
        if (lignes == null || lignes.isEmpty()) {
            throw new IllegalArgumentException("Facture must have at least one line");
        }
    }

    @Transactional(readOnly = true)
    public FactureDTO getFactureById(Long id) {
        Facture facture = factureRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture not found"));
        return convertToDTO(facture);
    }

    @Transactional(readOnly = true)
    public List<FactureDTO> getAllFactures() {
        List<Facture> factures = factureRepository.findAllWithLignes();
        return factures.stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional
    public FactureDTO updateFacture(Long id, FactureDTO dto) {
        validateClientAndFournisseurIds(dto);
        Facture facture = factureRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture not found"));

        // Clear existing lines and GrandLivre entries
        facture.getLignes().clear();
        grandLivreRepository.deleteByFactureId(id);

        // Update client/fournisseur
        if (dto.getClientId() != null) {
            Client client = clientRepository.findById(dto.getClientId().intValue())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            facture.setClient(client);
            facture.setFournisseur(null);
        } else {
            Fournisseur fournisseur = fournisseurRepository.findById(dto.getFournisseurId().intValue())
                    .orElseThrow(() -> new IllegalArgumentException("Fournisseur not found"));
            facture.setFournisseur(fournisseur);
            facture.setClient(null);
        }

        // Update basic fields
        facture.setPaymentMethod(dto.getPaymentMethod());
        facture.setCurrency(dto.getCurrency());
        facture.setDiscount(dto.getDiscount());
        facture.setPaid(dto.isPaid());
        facture.setComment(dto.getComment());
        facture.setIssueDate(dto.getIssueDate());
        facture.setPaymentDate(dto.getPaymentDate());

        // Add new lines
        for (FactureLigneDTO ligneDTO : dto.getLignes()) {
            FactureLigne ligne = createFactureLigne(ligneDTO);
            facture.addLigne(ligne);
        }

        facture.calculateTotals();
        Facture updated = factureRepository.save(facture);

        // Recreate GrandLivre entries
        createGrandLivreEntries(updated);

        return convertToDTO(updated);
    }

    @Transactional
    public void deleteFacture(Long id) {
        // Delete GrandLivre entries first
        grandLivreRepository.deleteByFactureId(id);
        // Then delete the facture
        factureRepository.deleteById(id);
    }

    private FactureDTO convertToDTO(Facture facture) {
        FactureDTO dto = new FactureDTO();
        dto.setId(facture.getId());
        dto.setReference(facture.getReference());
        dto.setClientId(facture.getClient() != null ? (long) facture.getClient().getId() : null);
        dto.setFournisseurId(facture.getFournisseur() != null ? (long) facture.getFournisseur().getId() : null);
        dto.setPaymentMethod(facture.getPaymentMethod());
        dto.setCurrency(facture.getCurrency());
        dto.setDiscount(facture.getDiscount());
        dto.setPaid(facture.isPaid());
        dto.setComment(facture.getComment());
        dto.setIssueDate(facture.getIssueDate());
        dto.setPaymentDate(facture.getPaymentDate());
        dto.setTotalHT(facture.getTotalHT());
        dto.setTotalTVA(facture.getTotalTVA());
        dto.setTotalTTC(facture.getTotalTTC());

        dto.setLignes(facture.getLignes().stream().map(ligne -> {
            FactureLigneDTO ligneDTO = new FactureLigneDTO();
            ligneDTO.setId(ligne.getId());
            ligneDTO.setCompteId(ligne.getCompte().getId());
            ligneDTO.setArticleId((long) ligne.getArticle().getId());
            ligneDTO.setQuantite(ligne.getQuantite());
            ligneDTO.setPrixUnitaire(ligne.getPrixUnitaire());
            ligneDTO.setTvaRate(ligne.getTvaRate());
            return ligneDTO;
        }).toList());

        return dto;
    }

    public List<Facture> getAllFactureEntities() {
        return factureRepository.findAllWithLignes();
    }

    public Facture getFactureEntityById(Long id) {
        return factureRepository.findByIdWithLignes(id)
                .orElseThrow(() -> new EntityNotFoundException("Facture not found"));
    }

    public List<Facture> getFactureByClient(int clientId) {
        return factureRepository.findByClientId(clientId);
    }


    public List<Facture> getFactureByFournisseur(int fournisseurId) {
        return factureRepository.findByFournisseurId(fournisseurId);
    }
}