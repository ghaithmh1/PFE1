package com.pfe.prj1.service;

import com.pfe.prj1.model.Classe;
import com.pfe.prj1.model.Compte;
import com.pfe.prj1.model.PlanComptable;
import com.pfe.prj1.repository.ClasseRepository;
import com.pfe.prj1.repository.CompteRepository;
import com.pfe.prj1.repository.PlanComptableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanComptableTunisienImporter {

    @Autowired
    private PlanComptableRepository planComptableRepository;

    @Autowired
    private ClasseRepository classeRepository;

    @Autowired
    private CompteRepository compteRepository;

    @Transactional
    public void importPlanComptableTunisien(String csvFilePath) throws IOException {

        // Vérifier si le plan comptable tunisien existe déjà
        PlanComptable planComptable = planComptableRepository.findByNom("Plan Comptable Tunisien")
                .orElseGet(() -> {
                    // Create the plan comptable only if it doesn't exist
                    PlanComptable newPlanComptable = new PlanComptable("Plan Comptable Tunisien");
                    return planComptableRepository.save(newPlanComptable);
                });

        // Maps pour stocker les éléments pendant l'importation
        Map<String, Classe> classesMap = new HashMap<>();
        Map<String, Compte> comptesMap = new HashMap<>();

        // Lire le fichier CSV
        try (BufferedReader br = new BufferedReader(new FileReader(csvFilePath))) {
            String line;
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Ignorer l'en-tête
                }

                // Traiter chaque ligne
                String[] data = parseCSVLine(line);
                if (data.length >= 3) {
                    String numero = data[0].replace("\"", "");
                    String libelle = data[1].replace("\"", "");
                    int level = Integer.parseInt(data[2].replace("\"", ""));

                    if (level == 1) {
                        // C'est une classe
                        Classe classe = new Classe(numero, libelle);
                        classe.setPlanComptable(planComptable);
                        classe = classeRepository.save(classe);
                        classesMap.put(numero, classe);
                    } else {
                        // C'est un compte
                        Compte compte = new Compte(numero, libelle);

                        // Déterminer la classe parente
                        String classePrefix = numero.substring(0, 1);
                        Classe classe = classesMap.get(classePrefix);
                        compte.setClasse(classe);

                        // Déterminer le compte parent
                        if (level > 2) {
                            String parentNumero = determinerParent(numero, level);
                            if (comptesMap.containsKey(parentNumero)) {
                                compte.setParent(comptesMap.get(parentNumero));
                            }
                        }

                        compte = compteRepository.save(compte);
                        comptesMap.put(numero, compte);
                    }
                }
            }
        }
    }

    // Fonction pour déterminer le numéro du compte parent
    private String determinerParent(String numero, int level) {
        // Pour les niveaux 3 à 6, on remonte d'un niveau en supprimant les derniers chiffres
        switch (level) {
            case 3: // Pour niveau 3, le parent est de niveau 2 (1er ou 2 premiers chiffres)
                return numero.substring(0, 2);
            case 4: // Pour niveau 4, le parent est de niveau 3
                return numero.substring(0, 3);
            case 5: // Pour niveau 5, le parent est de niveau 4
                return numero.substring(0, 4);
            case 6: // Pour niveau 6, le parent est de niveau 5
                return numero.substring(0, 5);
            default:
                return numero;
        }
    }

    // Fonction pour analyser une ligne CSV en tenant compte des guillemets
    private String[] parseCSVLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder field = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.add(field.toString());
                field = new StringBuilder();
            } else {
                field.append(c);
            }
        }
        result.add(field.toString());

        return result.toArray(new String[0]);
    }
}