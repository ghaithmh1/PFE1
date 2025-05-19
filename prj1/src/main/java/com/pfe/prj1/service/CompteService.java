package com.pfe.prj1.service;

import com.pfe.prj1.model.Compte;

import com.pfe.prj1.repository.ClasseRepository;
import com.pfe.prj1.repository.CompteRepository;
import com.pfe.prj1.repository.EcritureCompteRepository;
import com.pfe.prj1.repository.FactureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class CompteService {

    @Autowired
    private CompteRepository compteRepository;

    @Autowired
    private ClasseRepository classeRepository;

    @Autowired
    private FactureRepository factureRepository;

    @Autowired
    private EcritureCompteRepository ecritureCompteRepository;


    private final Pattern nodeNumberPattern = Pattern.compile("^\\d+$");

    public List<Compte> getAllComptes() {
        return compteRepository.findAll();
    }


    public Compte getCompteById(Long id) {
        return compteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compte non trouvé avec l'id: " + id));
    }

    public Compte findByCompteNumber(String numero) {
        Compte compte = compteRepository.findByNumero(numero);
        if (compte == null) {
            throw new RuntimeException("Compte non trouvé avec le numéro: " + numero);
        }
        return compte;
    }

    @Transactional
    public Compte createCompte(Compte compte, Long parentId) {
        validateCompteNumber(compte.getNumero());

        if (compteRepository.existsByNumero(compte.getNumero())) {
            throw new RuntimeException("Un compte avec ce numéro existe déjà: " + compte.getNumero());
        }

        // If parentId is provided, use it
        if (parentId != null) {
            Compte parent = getCompteById(parentId);
            compte.setParent(parent);
            // Hérite la classe du parent si non spécifiée
            if (compte.getClasse() == null) {
                compte.setClasse(parent.getClasse());
            }

            // Verify that child account number starts with parent number
            if (!compte.getNumero().startsWith(parent.getNumero())) {
                throw new RuntimeException("Le numéro du compte enfant doit commencer par le numéro du parent");
            }
        } else {
            // Try to find the most appropriate parent
            Compte potentialParent = findMostAppropriateParent(compte.getNumero());
            if (potentialParent != null) {
                compte.setParent(potentialParent);
            } else if (compte.getClasse() != null) {
                // Verify that root account number starts with class number
                if (!compte.getNumero().startsWith(compte.getClasse().getNumero())) {
                    throw new RuntimeException("Le numéro du compte racine doit commencer par le numéro de la classe");
                }
            }
        }

        return compteRepository.save(compte);
    }

    // Improved method to find the most appropriate parent
    public Compte findMostAppropriateParent(String numero) {
        // Find all potential parents (whose number is a prefix of the account number)
        List<Compte> potentialParents = compteRepository.findAll().stream()
                .filter(c -> numero.startsWith(c.getNumero()) && !c.getNumero().equals(numero))
                .toList();

        // Sort by number length in descending order to get the most specific parent first
        return potentialParents.stream()
                .sorted((a, b) -> Integer.compare(b.getNumero().length(), a.getNumero().length()))
                .findFirst()
                .orElse(null);
    }

    @Transactional
    public Compte updateCompte(Long id, Compte compteDetails) {
        Compte existingCompte = getCompteById(id);

        // Vérifier si le numéro change
        if (!existingCompte.getNumero().equals(compteDetails.getNumero())) {
            validateCompteNumber(compteDetails.getNumero());

            if (compteRepository.existsByNumero(compteDetails.getNumero()) &&
                    !existingCompte.getId().equals(compteRepository.findByNumero(compteDetails.getNumero()).getId())) {
                throw new RuntimeException("Un compte avec ce numéro existe déjà: " + compteDetails.getNumero());
            }


            existingCompte.setNumero(compteDetails.getNumero());
        }

        existingCompte.setNom(compteDetails.getNom());

        // Mise à jour de la classe si elle a changé
        if (compteDetails.getClasse() != null &&
                (existingCompte.getClasse() == null ||
                        existingCompte.getClasse().getId() != (compteDetails.getClasse().getId()))) {
            existingCompte.setClasse(compteDetails.getClasse());
        }

        // Mise à jour du parent si nécessaire
        if (compteDetails.getParent() != null &&
                (existingCompte.getParent() == null ||
                        existingCompte.getParent().getId() != (compteDetails.getParent().getId()))) {
            existingCompte.setParent(compteDetails.getParent());
        } else if (compteDetails.getParent() == null && existingCompte.getParent() != null) {
            existingCompte.setParent(null);
        }

        return compteRepository.save(existingCompte);
    }

    @Transactional
    public boolean deleteCompte(Long id) {
        // Vérifier si le compte existe avant de tenter de le supprimer
        if (!compteRepository.existsById(id)) {
            return false; // Retourne false si le compte n'existe pas
        }


        // Find all descendants first
        List<Long> descendantIds = findDescendantIds(id);

        // Add the current account ID to the list of IDs to delete
        descendantIds.add(id);

        // Delete all descendants and the current account in one go
        compteRepository.deleteAllById(descendantIds);

        return true;
    }

    private List<Long> findDescendantIds(Long parentId) {
        List<Long> descendantIds = new ArrayList<>();

        // Find immediate children
        List<Compte> children = compteRepository.findByParentId(parentId);

        for (Compte child : children) {
            descendantIds.add(child.getId());
            // Recursively find descendants of each child
            descendantIds.addAll(findDescendantIds(child.getId()));
        }

        return descendantIds;
    }

    private void validateCompteNumber(String numero) {
        if (!nodeNumberPattern.matcher(numero).matches()) {
            throw new RuntimeException("Format de numéro de compte invalide. Seuls les chiffres sont autorisés.");
        }
    }


}