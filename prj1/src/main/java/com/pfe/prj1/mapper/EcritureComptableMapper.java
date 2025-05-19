package com.pfe.prj1.mapper;

import com.pfe.prj1.dto.CompteRefDTO;
import com.pfe.prj1.dto.EcritureCompteDTO;
import com.pfe.prj1.dto.EcritureComptableDTO;
import com.pfe.prj1.model.Compte;
import com.pfe.prj1.model.EcritureCompte;
import com.pfe.prj1.model.EcritureComptable;
import com.pfe.prj1.repository.CompteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EcritureComptableMapper {

    @Autowired
    private CompteRepository compteRepository;

    public EcritureComptableDTO toDTO(EcritureComptable entity) {
        if (entity == null) {
            return null;
        }

        EcritureComptableDTO dto = new EcritureComptableDTO();
        dto.setId(entity.getId());
        dto.setNum(entity.getNum());
        dto.setReference(entity.getReference());
        dto.setStatut(entity.getStatut());
        dto.setDate(entity.getDate());

        if (entity.getLignes() != null) {
            dto.setLignes(entity.getLignes().stream()
                    .map(this::toEcritureCompteDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public EcritureComptable toEntity(EcritureComptableDTO dto) {
        if (dto == null) {
            return null;
        }

        EcritureComptable entity = new EcritureComptable();
        // Vérifier si l'ID n'est pas null avant de le définir
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setNum(dto.getNum());
        entity.setReference(dto.getReference());
        entity.setStatut(dto.getStatut());
        entity.setDate(dto.getDate());

        if (dto.getLignes() != null) {
            entity.setLignes(dto.getLignes().stream()
                    .map(this::toEcritureCompteEntity)
                    .collect(Collectors.toList()));

            // Établir la relation bidirectionnelle
            entity.getLignes().forEach(ligne -> ligne.setEcritureComptable(entity));
        }

        return entity;
    }

    public EcritureCompteDTO toEcritureCompteDTO(EcritureCompte entity) {
        if (entity == null) {
            return null;
        }

        EcritureCompteDTO dto = new EcritureCompteDTO();
        dto.setId(entity.getId());
        dto.setDescription(entity.getDescription());
        dto.setDebit(entity.getDebit());
        dto.setCredit(entity.getCredit());

        if (entity.getCompte() != null) {
            CompteRefDTO compteDTO = new CompteRefDTO();
            compteDTO.setId(entity.getCompte().getId());
            // Ajouter le numéro et le nom du compte pour l'affichage complet
            compteDTO.setNumero(entity.getCompte().getNumero());
            compteDTO.setNom(entity.getCompte().getNom());
            dto.setCompte(compteDTO);
        }

        return dto;
    }

    public EcritureCompte toEcritureCompteEntity(EcritureCompteDTO dto) {
        if (dto == null) {
            return null;
        }

        EcritureCompte entity = new EcritureCompte();
        // Vérifier si l'ID n'est pas null avant de le définir
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }
        entity.setDescription(dto.getDescription());
        entity.setDebit(dto.getDebit());
        entity.setCredit(dto.getCredit());

        if (dto.getCompte() != null && dto.getCompte().getId() != null) {
            // Récupérer le compte complet depuis la base de données
            Compte compte = compteRepository.findById(dto.getCompte().getId())
                    .orElse(new Compte());
            entity.setCompte(compte);
        }

        return entity;
    }
}