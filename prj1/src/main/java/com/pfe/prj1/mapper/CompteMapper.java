package com.pfe.prj1.mapper;

import com.pfe.prj1.dto.CompteDTO;
import com.pfe.prj1.dto.CompteResponseDTO;
import com.pfe.prj1.model.Compte;
import org.springframework.stereotype.Component;

@Component
public class CompteMapper {

    public Compte toEntity(CompteDTO dto) {
        Compte compte = new Compte();
        compte.setNumero(dto.getNumero());
        compte.setNom(dto.getNom());
        // Note: classe et parent seront gérés dans le service
        return compte;
    }

    public CompteResponseDTO toResponseDTO(Compte compte) {
        CompteResponseDTO dto = new CompteResponseDTO();
        dto.setId(compte.getId()); // Pas de problème ici car getId() retourne Long

        dto.setNumero(compte.getNumero());
        dto.setNom(compte.getNom());

        if (compte.getClasse() != null) {
            dto.setClasseId(compte.getClasse().getId()); // Assurez-vous que Classe.id est Long
            dto.setClasseNom(compte.getClasse().getNom());
        }

        if (compte.getParent() != null) {
            dto.setParentId(compte.getParent().getId()); // Assurez-vous que Compte.id est Long
            dto.setParentNumero(compte.getParent().getNumero());
        }

        return dto;
    }
}