package com.pfe.prj1.service;

import com.pfe.prj1.model.Classe;
import com.pfe.prj1.model.Compte;
import com.pfe.prj1.model.PlanComptable;
import com.pfe.prj1.repository.ClasseRepository;
import com.pfe.prj1.repository.CompteRepository;
import com.pfe.prj1.repository.PlanComptableRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ImportPlanComptableService {

    @Autowired
    private PlanComptableRepository planComptableRepository;

    @Autowired
    private ClasseRepository classeRepository;

    @Autowired
    private CompteRepository compteRepository;

    /**
     * Importe un plan comptable à partir d'un fichier Excel
     * @param file Le fichier Excel contenant le plan comptable
     * @param planComptableName Le nom du plan comptable à créer
     * @return Le plan comptable créé
     */
    @Transactional
    public PlanComptable importPlanComptable(MultipartFile file, String planComptableName) throws IOException {
        compteRepository.deleteAll();
        classeRepository.deleteAll();
        planComptableRepository.deleteAll();
        // Créer un nouveau plan comptable
        PlanComptable planComptable = new PlanComptable();
        planComptable.setNom(planComptableName);
        planComptable = planComptableRepository.save(planComptable);

        // Charger les données depuis Excel
        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            // D'abord lire l'onglet des classes s'il existe
            Map<String, String> classesNoms = new HashMap<>();
            try {
                Sheet classesSheet = workbook.getSheet("Classes");
                if (classesSheet != null) {
                    boolean isClassesHeader = true;
                    for (Row row : classesSheet) {
                        if (isClassesHeader) {
                            isClassesHeader = false;
                            continue;
                        }

                        // Vérifier si la ligne est vide
                        if (isEmptyRow(row)) {
                            continue;
                        }

                        // Lire le numéro et le nom de la classe
                        String numeroClasse = getCellValueAsString(row.getCell(0));
                        String nomClasse = getCellValueAsString(row.getCell(1));

                        if (numeroClasse != null && !numeroClasse.trim().isEmpty() &&
                                nomClasse != null && !nomClasse.trim().isEmpty()) {
                            classesNoms.put(numeroClasse, nomClasse);
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("Erreur lors de la lecture de l'onglet Classes: " + e.getMessage());
                // Continuer même si l'onglet Classes n'existe pas ou en cas d'erreur
            }

            // Ensuite traiter l'onglet principal avec les comptes
            Sheet sheet = workbook.getSheetAt(0);

            // Map pour stocker les comptes créés indexés par numéro
            Map<String, Compte> comptesMap = new HashMap<>();
            Map<String, Classe> classesMap = new HashMap<>();

            // Collecter toutes les données d'abord
            List<CompteTempData> comptesData = new ArrayList<>();

            // Ignorer la ligne d'en-tête
            boolean isHeader = true;

            for (Row row : sheet) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                // Vérifier si la ligne est vide
                if (isEmptyRow(row)) {
                    continue;
                }

                // Extraire les valeurs des colonnes
                String numero = getCellValueAsString(row.getCell(0));
                String nom = getCellValueAsString(row.getCell(1));
                String numeroParent = getCellValueAsString(row.getCell(2));
                String numeroClasse = getCellValueAsString(row.getCell(3));

                if (numero == null || numero.trim().isEmpty() || nom == null || nom.trim().isEmpty()) {
                    continue; // Ignorer les lignes sans numéro ou nom
                }

                // Stocker temporairement les données
                comptesData.add(new CompteTempData(numero, nom, numeroParent, numeroClasse));
            }

            // 1. D'abord créer toutes les classes
            for (CompteTempData data : comptesData) {
                if (data.numeroClasse != null && !data.numeroClasse.isEmpty()) {
                    getOrCreateClasse(data.numeroClasse, planComptable, classesMap, classesNoms);
                }
            }

            // 2. Ensuite créer tous les comptes racines (sans parent)
            for (CompteTempData data : comptesData) {
                if (data.numeroParent == null || data.numeroParent.isEmpty()) {
                    Classe classe = classesMap.get(data.numeroClasse);

                    Compte compte = new Compte();
                    compte.setNumero(data.numero);
                    compte.setNom(data.nom);
                    compte.setClasse(classe);

                    compte = compteRepository.save(compte);
                    comptesMap.put(data.numero, compte);
                }
            }

            // 3. Finalement créer les comptes avec parents (plusieurs passes peuvent être nécessaires)
            boolean accountsAdded = true;
            List<CompteTempData> remainingAccounts = comptesData.stream()
                    .filter(data -> data.numeroParent != null && !data.numeroParent.isEmpty())
                    .collect(Collectors.toList());

            while (!remainingAccounts.isEmpty() && accountsAdded) {
                accountsAdded = false;

                Iterator<CompteTempData> iterator = remainingAccounts.iterator();
                while (iterator.hasNext()) {
                    CompteTempData data = iterator.next();

                    // Si le parent existe maintenant
                    if (comptesMap.containsKey(data.numeroParent)) {
                        Compte parent = comptesMap.get(data.numeroParent);
                        Classe classe = parent.getClasse(); // Hériter la classe du parent

                        Compte compte = new Compte();
                        compte.setNumero(data.numero);
                        compte.setNom(data.nom);
                        compte.setClasse(classe);
                        compte.setParent(parent);

                        compte = compteRepository.save(compte);
                        comptesMap.put(data.numero, compte);

                        iterator.remove();
                        accountsAdded = true;
                    }
                }
            }

            // Si des comptes restent, c'est qu'ils ont des parents qui n'existent pas
            if (!remainingAccounts.isEmpty()) {
                System.out.println("Avertissement: Certains comptes ont des références à des parents qui n'existent pas");

                // Créer ces comptes sans parent
                for (CompteTempData data : remainingAccounts) {
                    Classe classe = classesMap.get(data.numeroClasse);

                    Compte compte = new Compte();
                    compte.setNumero(data.numero);
                    compte.setNom(data.nom);
                    compte.setClasse(classe);

                    compteRepository.save(compte);
                }
            }

            return planComptable;
        }
    }

    // Classe utilitaire pour stocker temporairement les données de compte
    private static class CompteTempData {
        public String numero;
        public String nom;
        public String numeroParent;
        public String numeroClasse;

        public CompteTempData(String numero, String nom, String numeroParent, String numeroClasse) {
            this.numero = numero;
            this.nom = nom;
            this.numeroParent = numeroParent;
            this.numeroClasse = numeroClasse;
        }
    }
    /**
     * Récupère ou crée une classe avec le numéro spécifié
     */
    private Classe getOrCreateClasse(String numeroClasse, PlanComptable planComptable,
                                     Map<String, Classe> classesMap, Map<String, String> classesNoms) {
        if (numeroClasse == null || numeroClasse.trim().isEmpty()) {
            return null;
        }

        // Vérifier si la classe a déjà été créée
        Classe classe = classesMap.get(numeroClasse);
        if (classe != null) {
            return classe;
        }

        // Utiliser le nom défini dans l'onglet Classes s'il existe, sinon utiliser un nom générique
        String nomClasse = classesNoms.getOrDefault(numeroClasse, "Classe " + numeroClasse);

        // Créer une nouvelle classe pour ce plan comptable
        classe = new Classe();
        classe.setNumero(numeroClasse);
        classe.setNom(nomClasse);
        classe.setPlanComptable(planComptable);  // Associer au nouveau plan comptable
        classe = classeRepository.save(classe);

        classesMap.put(numeroClasse, classe);
        return classe;
    }

    /**
     * Vérifie si une ligne est vide
     */
    private boolean isEmptyRow(Row row) {
        if (row == null) {
            return true;
        }

        if (row.getFirstCellNum() == -1) {
            return true;
        }

        boolean isEmpty = true;
        for (int cellNum = row.getFirstCellNum(); cellNum < row.getLastCellNum(); cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                isEmpty = false;
                break;
            }
        }

        return isEmpty;
    }

    /**
     * Récupère la valeur d'une cellule en tant que chaîne de caractères
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    return String.valueOf((int) numericValue);
                }
                return String.valueOf(numericValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf(cell.getStringCellValue());
                } catch (Exception e) {
                    try {
                        return String.valueOf(cell.getNumericCellValue());
                    } catch (Exception ex) {
                        return "";
                    }
                }
            default:
                return "";
        }
    }
}