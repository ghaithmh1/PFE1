import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const PlanComptable = () => {
  // State management
  const [classes, setClasses] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [importFileName, setImportFileName] = useState(""); // Nom du fichier importé
  const [importError, setImportError] = useState(""); // Erreur d'importation
  const [currentCompte, setCurrentCompte] = useState({
    id: null,
    numero: "",
    nom: "",
    classeId: null,
    parentId: null,
    parent: null
  });
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const navigate = useNavigate();
  
  // Fonction de navigation
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Récupérer les classes et comptes au chargement du composant
  useEffect(() => {
    fetchClasses();
    fetchComptes();
  }, []);
  // Automatically select first class after loading
  useEffect(() => {
    if (classes.length > 0 && !selectedClasse ) {
      setSelectedClasse(classes[0]);
    }
  }, [classes]);

  // Récupérer toutes les classes comptables
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/classe");
      if (response.data ) {
        setClasses(response.data);
        
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des classes comptables");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer tous les comptes
  const fetchComptes = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/compte");
      if (response.data) {
        setComptes(response.data);
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des comptes");
    } finally {
      setLoading(false);
    }
  };

  // Gérer les erreurs API de manière centralisée
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          toast.error(error.response.data.message || "Données invalides");
          break;
        case 404:
          toast.error("Ressource non trouvée");
          break;
        case 500:
          toast.error("Erreur serveur. Veuillez réessayer plus tard.");
          break;
        default:
          toast.error(error.response.data?.message || defaultMessage);
      }
    } else if (error.request) {
      toast.error("Impossible de se connecter au serveur.");
    } else {
      toast.error("Erreur de configuration de la requête");
    }
  };

  // Validate account number format based on parent
  const validateNumeroFormat = (numero, parentNumero) => {
    if (!numero) return false;
    
    if (parentNumero) {
      return numero.startsWith(parentNumero) && numero.length > parentNumero.length;
    } else if (selectedClasse) {
      return numero.startsWith(selectedClasse.numero.toString());
    }
    return true;
  };

  // Generate suggested account number based on parent or class
  const generateSuggestedNumero = (parent) => {
    if (parent) {
      // Find sibling accounts with the same parent
      const siblingComptes = comptes.filter(c => c.parent?.id === parent.id);
      
      // Process numeric suffixes
      const suffixes = siblingComptes
        .map(c => c.numero.slice(parent.numero.length))
        .filter(suffix => /^\d+$/.test(suffix))
        .map(Number);
      
      // Calculate next suffix
      const nextSuffix = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 1;
      return `${parent.numero}${nextSuffix}`;
    } 
    
    if (selectedClasse && selectedClasse.numero) {
      // First-level accounts for this class
      const rootComptes = comptes.filter(c => !c.parent && c.classe?.id === selectedClasse.id);
      
      const classeNumeroStr = selectedClasse.numero.toString();
      const suffixes = rootComptes
        .map(c => c.numero.slice(classeNumeroStr.length))
        .filter(suffix => /^\d+$/.test(suffix))
        .map(Number);
      
      const nextSuffix = suffixes.length > 0 ? Math.max(...suffixes) + 1 : 1;
      return `${classeNumeroStr}${nextSuffix.toString().padStart(1, '0')}`;
    }
    
    return "";
  };

  // Check for duplicate account numbers or names
  function checkDuplicateNumeroOrNom(numero, nom) {
    // Filter accounts based on mode (edit or not)
    let comptesAVerifier = comptes;
    if (editMode) {
      comptesAVerifier = comptes.filter(c => c.id !== currentCompte.id);
    }
    
    // Check for duplicates
    const existeNumero = comptesAVerifier.find(c => c.numero === numero);
    const existeNom = comptesAVerifier.find(c => c.nom.toLowerCase() === nom.toLowerCase());
    
    // Display error messages if needed
    if (existeNumero && existeNom) {
      toast.error('Un compte avec le numéro ' + numero + ' et le nom ' + nom + ' existe déjà');
      return true;
    }

    if (existeNumero) {
      toast.error('Un compte avec le numéro ' + numero + ' existe déjà');
      return true;
    }
    
    if (existeNom) {
      toast.error('Un compte avec le nom "' + nom + '" existe déjà');
      return true;
    }
    
    return false;
  }

  // Find the most appropriate parent based on account number
  const findMostAppropriateParent = (numero) => {
    // Sort existing accounts by descending number length
    const sortedComptes = comptes
      .filter(c => numero.startsWith(c.numero) && c.numero !== numero)
      .sort((a, b) => b.numero.length - a.numero.length);
    
    // Return the first matching account (longest prefix)
    return sortedComptes.length > 0 ? sortedComptes[0] : null;
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!currentCompte.nom?.trim()) {
      toast.error("Le nom du compte ne peut pas être vide");
      return false;
    }
    
    if (!currentCompte.numero?.trim()) {
      toast.error("Le numéro du compte ne peut pas être vide");
      return false;
    }

    // Check for duplicates
    if (checkDuplicateNumeroOrNom(currentCompte.numero, currentCompte.nom)) {
      return false;
    }
    
    // Validate account number format
    if (currentCompte.parent) {
      if (!validateNumeroFormat(currentCompte.numero, currentCompte.parent.numero)) {
        toast.error(`Le numéro du compte doit commencer par le numéro du compte parent (${currentCompte.parent.numero}) et être plus long`);
        return false;
      }
    } else if (selectedClasse) {
      if (!validateNumeroFormat(currentCompte.numero, selectedClasse.numero.toString())) {
        toast.error(`Le numéro du compte doit commencer par le numéro de la classe (${selectedClasse.numero})`);
        return false;
      }
    }
    
    if (!currentCompte.classeId) {
      toast.error("Veuillez sélectionner une classe comptable");
      return false;
    }
    
    return true;
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Mettre à jour l'état avec les nouvelles valeurs
    setCurrentCompte(prev => ({
      ...prev,
      [name]: name === "classeId" || name === "parentId" 
        ? (value ? parseInt(value) : null) 
        : value
    }));
    
    // Auto-détecter le parent lorsque le numéro de compte change
    if (name === "numero" && value) {
      const potentialParent = findMostAppropriateParent(value);
      if (potentialParent && potentialParent.id !== currentCompte.parent?.id) {
        setCurrentCompte(prev => ({
          ...prev,
          parent: potentialParent,
          parentId: potentialParent.id
        }));
      }
    }
  };

  // Handle parent account selection
  const handleParentChange = (e) => {
    const parentId = parseInt(e.target.value);
    const parent = parentId ? comptes.find(c => c.id === parentId) : null;
    
    // Suggest a number based on parent or class
    let suggestedNumero = currentCompte.numero;
    
    if (parent) {
      // Check if current number is valid with new parent
      if (!validateNumeroFormat(currentCompte.numero, parent.numero)) {
        suggestedNumero = generateSuggestedNumero(parent);
      }
    } 
    else if (!editMode) {
      // If removing parent, suggest a number based on class for new accounts
      suggestedNumero = generateSuggestedNumero(null);
    }
    
    setCurrentCompte({
      ...currentCompte,
      parent: parent,
      parentId: parentId,
      numero: suggestedNumero
    });
  };

  // Get potential parent accounts
  const getPotentialParentComptes = () => {
    if (editMode && currentCompte.id) {
      // Exclude current account and its descendants
      const descendantIds = findDescendantIds(currentCompte.id);
      return comptes.filter(c => 
        c.id !== currentCompte.id && !descendantIds.includes(c.id)
      );
    } else {
      // For a new account, all accounts can be parents
      return comptes;
    }
  };

  // Find all descendant IDs of an account
  const findDescendantIds = (compteId) => {
    const result = [];
    
    // Recursive function to find descendants
    const findChildren = (parentId) => {
      const children = comptes.filter(c => c.parent && c.parent.id === parentId);
      
      children.forEach(child => {
        result.push(child.id);
        findChildren(child.id);
      });
    };
    
    findChildren(compteId);
    return result;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) return;    
    try {
      // Créer une copie du currentCompte pour éviter de modifier l'état directement
      const compteToSend = { ...currentCompte };
      
      // Afficher les données dans la console pour déboguer
      console.log("Données envoyées au serveur :", compteToSend);
      
      if (editMode) {
        // Mettre à jour un compte existant
        const response = await axios.put(`http://localhost:8080/compte/${compteToSend.id}`, compteToSend);
        toast.success("Compte mis à jour avec succès");
      } else {
        // Créer un nouveau compte
        const response = await axios.post("http://localhost:8080/compte", compteToSend, { 
          params: { 
            parentId: compteToSend.parentId 
          } 
        });
        toast.success("Compte ajouté avec succès");
      }
      
      // Rafraîchir la liste des comptes
      fetchComptes();
      // Réinitialiser le formulaire
      resetForm();
    } catch (err) {
      handleApiError(err, "Erreur lors de l'enregistrement du compte");
    }
  };

  // Supprimer un compte
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce compte et tous ses sous-comptes?")) {
      try {
        await axios.delete(`http://localhost:8080/compte/${id}`);
        toast.success("Compte et ses sous-comptes supprimés avec succès");
        
        fetchComptes();
      } catch (err) {
        handleApiError(err, "Erreur lors de la suppression du compte");
      }
    }
  };

  // Modifier un compte
  const handleEdit = (compte) => {
    setCurrentCompte({
      id: compte.id,
      numero: compte.numero,
      nom: compte.nom,
      classeId: compte.classeId || (compte.classe ? compte.classe.id : null),
      parentId: compte.parentId || (compte.parent ? compte.parent.id : null),
      parent: compte.parent
    });
    setEditMode(true);
    setShowForm(true);
    toast.info("Mode édition activé");
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCurrentCompte({
      id: null,
      numero: generateSuggestedNumero(null),
      nom: "",
      classeId: selectedClasse ? selectedClasse.id : null,
      parentId: null,
      parent: null
    });
    setEditMode(false);
    setShowForm(false);
  };

  // Filtrer les comptes par classe
  const handleClasseClick = (classe) => {
    setSelectedClasse(classe);
    setCurrentCompte(prev => ({
      ...prev,
      classeId: classe.id,
      numero: generateSuggestedNumero(null)
    }));
  };

  // Obtenir le nom de la classe sélectionnée
  const getSelectedClasseName = () => {
    if (!selectedClasse) return "Toutes les classes";
    return `${selectedClasse.numero} - ${selectedClasse.nom}`;
  };

  // Add new account
  const handleAddCompte = () => {
    if (showForm) {
      resetForm();
    } else {
      setCurrentCompte({
        id: null,
        numero: generateSuggestedNumero(null),
        nom: "",
        classeId: selectedClasse ? selectedClasse.id : null,
        parentId: null,
        parent: null
      });
      setEditMode(false);
      setShowForm(true);
    }
  };

  // Construire une structure hiérarchique pour les comptes
  const buildHierarchy = () => {
  if (!comptes || comptes.length === 0) return [];
  
  // 1. Créer un map de tous les comptes par ID
  const comptesMap = {};
  comptes.forEach(compte => {
    comptesMap[compte.id] = { ...compte, children: [] };
  });

  // 2. Construire la hiérarchie
  const rootComptes = [];
  
  // D'abord traiter les comptes sans parent (niveau 1)
  comptes.forEach(compte => {
    if (selectedClasse && compte.classeId !== selectedClasse.id && compte.classe?.id !== selectedClasse.id) {
      return; // Filtrer par classe sélectionnée
    }

    if (!compte.parentId && !compte.parent) {
      rootComptes.push(comptesMap[compte.id]);
    }
  });

  // Ensuite traiter les niveaux suivants de manière récursive
  const processLevel = (parentNumero, parentId, level) => {
    // Trouver tous les comptes qui commencent par parentNumero et ont exactement level+1 chiffres
    const children = comptes.filter(compte => {
      // Vérifier la longueur du numéro
      const expectedLength = parentNumero.length + 1;
      if (compte.numero.length !== expectedLength) return false;
      
      // Vérifier que le numéro commence par parentNumero
      if (!compte.numero.startsWith(parentNumero)) return false;
      
      // Vérifier le parent direct
      return (compte.parentId === parentId || 
             (compte.parent && compte.parent.id === parentId));
    });

    // Trier les enfants par numéro
    children.sort((a, b) => a.numero.localeCompare(b.numero));

    // Ajouter les enfants et traiter leurs descendants
    children.forEach(child => {
      if (comptesMap[child.id]) {
        if (parentId) {
          comptesMap[parentId].children.push(comptesMap[child.id]);
        }
        processLevel(child.numero, child.id, level + 1);
      }
    });
  };

  // Commencer le traitement pour chaque racine
  rootComptes.forEach(root => {
    processLevel(root.numero, root.id, 1);
  });

  // Trier les comptes racine
  rootComptes.sort((a, b) => a.numero.localeCompare(b.numero));

  return rootComptes;
};

  // Créer une liste plate à partir de la hiérarchie
  const flattenHierarchy = (hierarchy) => {
  let result = [];
  
  const flatten = (items, level = 0) => {
    items.forEach(item => {
      result.push({...item, level});
      if (item.children && item.children.length > 0) {
        flatten(item.children, level + 1);
      }
    });
  };
  
  flatten(hierarchy);
  return result;
};

 // FONCTION AMÉLIORÉE: Exporter un modèle Excel
const exportTemplate = () => {
  setExportLoading(true);
  try {
    // Créer un modèle avec des exemples plus structurés
    const template = [
      // Classe 1
      {
        Numéro: "1",
        Nom: "Comptes de capitaux",
        "Numéro Parent": "",
        "Numéro Classe": "1"
      },
      {
        Numéro: "10",
        Nom: "Capital et réserves",
        "Numéro Parent": "1",
        "Numéro Classe": "1"
      },
      {
        Numéro: "101",
        Nom: "Capital social",
        "Numéro Parent": "10",
        "Numéro Classe": "1"
      },
      {
        Numéro: "1011",
        Nom: "Capital souscrit - non appelé",
        "Numéro Parent": "101",
        "Numéro Classe": "1"
      },
      // Classe 2
      {
        Numéro: "2",
        Nom: "Comptes d'immobilisations",
        "Numéro Parent": "",
        "Numéro Classe": "2"
      },
      {
        Numéro: "20",
        Nom: "Immobilisations incorporelles",
        "Numéro Parent": "2",
        "Numéro Classe": "2"
      },
      {
        Numéro: "201",
        Nom: "Frais d'établissement",
        "Numéro Parent": "20",
        "Numéro Classe": "2"
      }
    ];

    // Créer une feuille de calcul
    const classeur = XLSX.utils.book_new();
    const feuilleDeCalcul = XLSX.utils.json_to_sheet(template);

    const largeurColonnes = [
      { wch: 15 }, 
      { wch: 35 },
      { wch: 15 }, 
      { wch: 15 }, 
    ];
    feuilleDeCalcul['!cols'] = largeurColonnes;
    
    // Ajouter des feuilles supplémentaires avec des explications
    XLSX.utils.book_append_sheet(classeur, feuilleDeCalcul, "Plan Comptable");

    // Ajouter un exemple de hiérarchie complexe
    const exempleDetaille = [
      {
        "Numéro Classe": "1",
        "Nom Classe": "capitaux propres et passifs non courants"
      },
      {
        "Numéro Classe": "2",
        "Nom Classe": "actifs non courants"
      },
      {
        "Numéro Classe": "3",
        "Nom Classe": "stocks"
      },
      {
        "Numéro Classe": "4",
        "Nom Classe": "tiers"
      },
      {
        "Numéro Classe": "5",
        "Nom Classe": "Comptes financiers"
      },
      {
        "Numéro Classe": "6",
        "Nom Classe": "charges"
      },
      {
        "Numéro Classe": "7",
        "Nom Classe": "produits"
      }
    ];
    
    const wsExemple = XLSX.utils.json_to_sheet(exempleDetaille);
    const largeurColonnes2 = [
      { wch: 15 }, 
      { wch: 35 },
    ];
    wsExemple['!cols'] = largeurColonnes2;
    
    XLSX.utils.book_append_sheet(classeur, wsExemple, "Classes");
    
    // Instructions dans une autre feuille
    const instructions = [
      { 
        Instructions: "Format d'importation du plan comptable:",
        "": ""
      },
      { 
        Instructions: "1. Numéro: Le numéro du compte (obligatoire)",
        "": ""
      },
      { 
        Instructions: "2. Nom: Le nom du compte (obligatoire)",
        "": ""
      },
      { 
        Instructions: "3. Numéro Parent: Le numéro du compte parent (optionnel)",
        "": ""
      },
      { 
        Instructions: "4. Numéro Classe: Le numéro de la classe comptable (obligatoire)",
        "": ""
      }
    ];
    
    const wsInstructions = XLSX.utils.json_to_sheet(instructions);

    const largeurColonnes3 = [
      { wch: 65 }, 
    ];

    wsInstructions['!cols'] = largeurColonnes3;

    XLSX.utils.book_append_sheet(classeur, wsInstructions, "Instructions");
    
    // Générer le fichier Excel et déclencher le téléchargement
    XLSX.writeFile(classeur, "plan_comptable_modele.xlsx");
    toast.success("Modèle de plan comptable téléchargé");
  } catch (error) {
    toast.error("Erreur lors de l'exportation du modèle");
    console.error("Erreur d'exportation:", error);
  } finally {
    setExportLoading(false);
  }
};

  // NOUVELLE FONCTION: Exporter le plan comptable actuel
  const buildHierarchyForExport = () => {
    if (!comptes || comptes.length === 0) return [];
    
    const comptesMap = {};
    const rootComptes = [];
  
    comptes.forEach(compte => {
      comptesMap[compte.id] = { ...compte, children: [] };
    });
  
    comptes.forEach(compte => {
      if (compte.parentId || compte.parent) {
        const parentId = compte.parentId || compte.parent?.id;
        const parent = comptesMap[parentId];
        if (parent) {
          parent.children.push(comptesMap[compte.id]);
        } else {
          rootComptes.push(comptesMap[compte.id]);
        }
      } else {
        rootComptes.push(comptesMap[compte.id]);
      }
    });
  
    const sortByNumber = (a, b) => {
      return a.numero.localeCompare(b.numero, undefined, { numeric: true });
    };
  
    const sortHierarchy = (comptes) => {
      comptes.sort(sortByNumber);
      comptes.forEach(compte => {
        if (compte.children.length > 0) {
          sortHierarchy(compte.children);
        }
      });
    };
  
    sortHierarchy(rootComptes);
    return rootComptes;
  };
  
  const exportCurrentPlan = () => {
    setExportLoading(true);
    try {
      // Utiliser la fonction spéciale pour l'export qui ignore le filtre de classe
      const flatAccounts = flattenHierarchy(buildHierarchyForExport());
      
      // Préparer un mapping des comptes par ID pour faciliter la recherche
      const comptesById = {};
      comptes.forEach(compte => {
        comptesById[compte.id] = compte;
      });
  
      // Préparer un mapping des classes par ID
      const classesById = {};
      classes.forEach(classe => {
        classesById[classe.id] = classe;
      });
  
      const exportData = flatAccounts.map(compte => {
        // Trouver le parent complet si disponible
        const parentCompte = compte.parentId ? comptesById[compte.parentId] : compte.parent;
        
        // Trouver la classe complète si disponible
        const classeCompte = compte.classeId ? classesById[compte.classeId] : compte.classe;
        
        return {
          Numéro: compte.numero,
          Nom: compte.nom,
          "Numéro Parent": parentCompte?.numero || "",
          "Numéro Classe": classeCompte?.numero || ""
        };
      });
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      const largeurColonnes = [
        { wch: 15 }, 
        { wch: 35 },
        { wch: 15 }, 
        { wch: 15 }, 
      ];

      ws['!cols'] = largeurColonnes;
      XLSX.utils.book_append_sheet(wb, ws, "Plan Comptable");
      
      // Ajouter une deuxième feuille avec les classes pour référence
      const classesSheetData = classes.map(classe => ({
        "Numéro Classe": classe.numero,
        "Nom Classe": classe.nom
      }));
      const wsClasses = XLSX.utils.json_to_sheet(classesSheetData);
      const largeurColonnes2 = [
        { wch: 15 }, 
        { wch: 35 },
      ];
      wsClasses['!cols'] = largeurColonnes2;
      XLSX.utils.book_append_sheet(wb, wsClasses, "Classes");
      
      // Générer le fichier Excel et déclencher le téléchargement
      XLSX.writeFile(wb, "plan_comptable_export.xlsx");
      toast.success("Plan comptable exporté avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'exportation du plan comptable");
      console.error("Erreur d'exportation:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImportFileName(file.name);
  setImportLoading(true);
  setImportError("");

  try {
    // Vérifier le type de fichier
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      throw new Error("Seuls les fichiers Excel (.xlsx, .xls) sont acceptés");
    }

    // Demander le nom du plan comptable
    const planName = prompt("Veuillez entrer un nom pour le plan comptable:");
    if (!planName) {
      setImportLoading(false);
      return;
    }

    // Préparer les données pour l'envoi
    const formData = new FormData();
    formData.append("file", file);
    formData.append("nom", planName);

    // Envoyer au backend
    const response = await axios.post(
      "http://localhost:8080/plan-comptable/import", 
      formData, 
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    toast.success("Plan comptable importé avec succès");

  setSelectedClasse(null);
  setClasses([]);
  setComptes([]);

    
    // Rafraîchir les données
    await fetchClasses();
    await fetchComptes();
    
    if (classes.length > 0 && !selectedClasse) {
        setSelectedClasse(classes[0]);
      }
  } catch (error) {
    console.error("Erreur lors de l'importation:", error);
    setImportError(error.message);
    toast.error(`Erreur d'importation: ${error.message}`);
  } finally {
    setImportLoading(false);
    e.target.value = ""; // Réinitialiser l'input file
  }
};

  // Composant pour afficher un compte unique
  const CompteItem = ({ compte, level = 0 }) => {
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-3">
          <div style={{ marginLeft: `${level * 20}px` }} className="flex items-center">
            <span className="text-gray-700 font-medium">
              {compte.numero}
            </span>
          </div>
        </td>
        <td className="px-6 py-3">
          <div style={{ marginLeft: `${level * 20}px` }}>
            {compte.nom}
          </div>
        </td>
        <td className="px-6 py-3 text-right whitespace-nowrap">
          <button
            onClick={() => handleEdit(compte)}
            className="text-blue-600 hover:text-blue-800 mr-4"
          >
            Modifier
          </button>
          <button
            onClick={() => handleDelete(compte.id)}
            className="text-red-600 hover:text-red-800"
          >
            Supprimer
          </button>
        </td>
      </tr>
    );
  };

  const hierarchicalComptes = buildHierarchy();
  const flattenedComptes = flattenHierarchy(hierarchicalComptes);
  const potentialParents = getPotentialParentComptes();

  return (
    <div className="min-h-screen bg-gray-100">
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="flex pt-6 px-6 gap-6">
      {/* Contenu principal */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Plan Comptable Hiérarchique</h1>
            <div className="flex gap-2">
              <button
                onClick={exportTemplate}
                disabled={exportLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                {exportLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Export...
                  </>
                ) : "Exporter Modèle"}
              </button>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer flex items-center">
                {importLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Import...
                  </>
                ) : (
                  <>
                    <span>Importer Excel</span>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleImport} 
                      className="hidden" 
                      disabled={importLoading}
                    />
                  </>
                )}
              </label>
              <button
                onClick={exportCurrentPlan}
                disabled={exportLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                {exportLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Export...
                  </>
                ) : "Exporter Plan"}
              </button>
              <button
                onClick={handleAddCompte}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                {showForm ? "Annuler" : "Ajouter un compte"}
              </button>
            </div>
          </div>
          
          {/* Form Section - Appears when showForm is true */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                {editMode ? "Modifier le compte" : "Ajouter un nouveau compte"}
              </h2>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du compte
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={currentCompte.nom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro
                    </label>
                    <input
                      type="text"
                      name="numero"
                      value={currentCompte.numero || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                    {currentCompte.parent ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Le numéro doit commencer par {currentCompte.parent.numero} et être plus long
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Le numéro doit commencer par {selectedClasse?.numero || ""}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classe
                    </label>
                    <select
                      name="classeId"
                      value={currentCompte.classeId || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="">Sélectionner une classe</option>
                      {classes.map(classe => (
                        <option key={classe.id} value={classe.id}>
                          {classe.numero} - {classe.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compte parent
                    </label>
                    <select
                      name="parent"
                      value={currentCompte.parentId || ""}
                      onChange={handleParentChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Aucun (compte racine)</option>
                      {potentialParents.map(compte => (
                        <option key={compte.id} value={compte.id}>
                          {compte.numero} - {compte.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editMode ? "Mettre à jour" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Classes et comptes */}
          <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-6">
            {/* Classes Panel - Left Column */}
            <div className="md:w-1/3">
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">Classes Comptables</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {loading && !classes.length ? (
                    <div className="p-4 text-gray-500">Chargement des classes...</div>
                  ) : (
                    classes.map((classe) => (
                      <div 
                        key={classe.id} 
                        className={`p-4 cursor-pointer hover:bg-gray-100 ${
                          selectedClasse && selectedClasse.id === classe.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleClasseClick(classe)}
                      >
                        <span className="font-medium">{classe.numero} - {classe.nom}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Accounts Panel - Right Column */}
            <div className="md:w-2/3">
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-100 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-800">
                    Comptes : {getSelectedClasseName()}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-4 text-gray-500">Chargement des comptes...</div>
                  ) : hierarchicalComptes.length === 0 ? (
                    <div className="p-4 text-gray-500">Aucun compte trouvé pour cette classe</div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {flattenedComptes.map((compte) => (
                          <CompteItem key={compte.id} compte={compte} level={compte.level} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default PlanComptable;