import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./Articles.css";
import Pagination from "../../components/pagination/pagination";
import * as XLSX from 'xlsx';
import { useAccountId } from '../../hooks/useAccountId';


const POST_PER_PAGE = 5;

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // Nouveau state pour le modal d'importation
  const [importData, setImportData] = useState([]); // Stocker les données importées
  const [importFileName, setImportFileName] = useState(""); // Nom du fichier importé
  const [importError, setImportError] = useState(""); // Erreur d'importation
  const [editMode, setEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({
    id: null,
    designation: "",
    reference: "",
    description: "",
    tva: "TVA_19",
    prixVente: 0,
    prixAchat: 0,
    note: ""
  });
  const [detailsArticle, setDetailsArticle] = useState(null);
  const [filters, setFilters] = useState({
    designation: "",
    reference: "",
    minPrixVente: "",
    tva: ""
  });
  const [currentPage, setCurrentPage] = useState(1);

  const accountId = useAccountId();

  const navigate = useNavigate();

  // Récupérer les articles au chargement du composant
  useEffect(() => {
    if (accountId) {
      fetchArticles();
    }
  }, [accountId]);

  // Récupérer tous les articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/articles/account/${accountId}`);
      if(response.data){
        setArticles(response.data);
      }
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des articles", err);
      setError("Failed to load data");
      handleApiError(err, "Erreur lors de la récupération des articles");
    } finally {
      setLoading(false);
    }
  };

  // Gérer les erreurs API
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          toast.error(error.response.data?.message || "Données invalides");
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
      toast.error("Impossible de se connecter au serveur");
    } else {
      toast.error("Erreur de configuration de la requête");
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!currentArticle.designation?.trim()) {
      toast.error("La désignation de l'article ne peut pas être vide");
      return false;
    }
    if (!currentArticle.reference?.trim()) {
      toast.error("La référence ne peut pas être vide");
      return false;
    }
    if (currentArticle.prixVente <= 0) {
      toast.error("Le prix de vente doit être supérieur à 0");
      return false;
    }
    if (currentArticle.prixAchat < 0) {
      toast.error("Le prix d'achat ne peut pas être négatif");
      return false;
    }
    return true;
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentArticle({
      ...currentArticle,
      [name]: name === "prixVente" || name === "prixAchat" ? parseFloat(value) : value
    });
  };

  // Gérer les changements des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const articleToSend = { 
        ...currentArticle,
        accountId: accountId 
       };
      
       if (editMode && currentArticle.id) {
        await axios.put(
          `http://localhost:8080/articles/${currentArticle.id}/account/${accountId}`,
          articleToSend
        );
        toast.success("Article mis à jour avec succès");
      } else {
        await axios.post(
          "http://localhost:8080/articles",
          articleToSend
        );
        toast.success("Article ajouté avec succès");
      }
      
      fetchArticles();
      closeModal();
    } catch (err) {
      handleApiError(err, "Erreur lors de l'enregistrement de l'article");
    }
  };

  // Supprimer un article
const handleDelete = async (id) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer cet article?")) {
    try {
      await axios.delete(`http://localhost:8080/articles/${id}/account/${accountId}`);
      toast.success("Article supprimé avec succès");
      fetchArticles();
    } catch (err) {
      // Vérifier la structure de la réponse d'erreur
      if (err.response) {
        // Vérifier si la réponse contient la structure attendue (success, message, etc.)
        if (err.response.data && err.response.data.message && 
            err.response.data.message.includes("utilisé dans une ou plusieurs factures")) {
          toast.error("Impossible de supprimer : article utilisé dans des factures");
        } else {
          // Pour les autres erreurs, utiliser le gestionnaire générique
          handleApiError(err, "Erreur lors de la suppression de l'article");
        }
      } else {
        // En cas d'erreur réseau ou autre
        handleApiError(err, "Erreur lors de la suppression de l'article");
      }
    }
  }
}

  // Afficher les détails d'un article
  const handleViewDetails = (article) => {
    setDetailsArticle(article);
    setShowDetailsModal(true);
  };

  // Modifier un article
  const handleEdit = (article) => {
    setCurrentArticle(article);
    setEditMode(true);
    setShowModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCurrentArticle({
      id: null,
      designation: "",
      reference: "",
      description: "",
      tva: "TVA_19",
      prixVente: 0,
      prixAchat: 0,
      note: ""
    });
    setEditMode(false);
  };

  // Ouvrir le modal pour ajouter un article
  const handleAddArticle = () => {
    resetForm();
    setShowModal(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Fermer le modal d'importation
  const closeImportModal = () => {
    setShowImportModal(false);
    setImportData([]);
    setImportFileName("");
    setImportError("");
  };

  // Ouvrir le sélecteur de fichier
  const openFileSelector = () => {
    document.getElementById('fileImport').click();
  };

  // Format TVA pour affichage
  const formatTVA = (tvaValue) => {
    return tvaValue ? tvaValue.replace('TVA_', '') + '%' : '-';
  };

  // Fonction pour convertir le format de TVA lors de l'importation
  const convertTVA = (tvaValue) => {
    if (!tvaValue) return "TVA_19";
    
    // Supprimer le % et convertir en format attendu
    const cleanValue = tvaValue.toString().replace('%', '').trim();
    
    // Vérifier les valeurs acceptées
    const rates = {
      '0': 'TVA_0',
      '7': 'TVA_7',
      '13': 'TVA_13',
      '19': 'TVA_19'
    };
    
    return rates[cleanValue] || 'TVA_19'; // Valeur par défaut
  };

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesDesignation = filters.designation 
      ? article.designation.toLowerCase().includes(filters.designation.toLowerCase())
      : true;
    const matchesReference = filters.reference
      ? article.reference.toLowerCase().includes(filters.reference.toLowerCase())
      : true;
    const matchesMinPrixVente = filters.minPrixVente
      ? article.prixVente >= parseFloat(filters.minPrixVente)
      : true;
    const matchesTVA = filters.tva
      ? article.tva === filters.tva
      : true;

    return matchesDesignation && matchesReference && matchesMinPrixVente && matchesTVA;
  });

  // Pagination
  const pages = Math.ceil(filteredArticles.length / POST_PER_PAGE);
  const indexOfLastArticle = currentPage * POST_PER_PAGE;
  const indexOfFirstArticle = indexOfLastArticle - POST_PER_PAGE;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Fonction d'exportation vers Excel
  const exporterVersExcel = () => {
    try {
      // Créer un nouveau classeur
      const classeur = XLSX.utils.book_new();
      
      // Transformer les données en format pour worksheet
      const donneesPourExcel = articles.map(client => ({
        Désignation: client.designation || "",
        Référence: client.reference || "",
        PrixDeVente: client.prixVente || "",
        PrixDeAchat: client.prixAchat || "",
        TVA: formatTVA(client.tva) || "",
        Note: client.note || "",
        Description: client.description || ""
      }));
  
      // Créer une feuille de calcul avec les données
      const feuilleDeCalcul = XLSX.utils.json_to_sheet(donneesPourExcel);
      
      // Définir la largeur des colonnes
      const largeurColonnes = [
        { wch: 15 }, // Identifiant
        { wch: 20 }, // Nom
        { wch: 25 }, // Email
        { wch: 30 }, // Adresse
        { wch: 15 }, // CodePostal
        { wch: 15 }, // Téléphone
        { wch: 15 }  // Pays
      ];
      feuilleDeCalcul['!cols'] = largeurColonnes;
      
      // Ajouter la feuille au classeur
      XLSX.utils.book_append_sheet(classeur, feuilleDeCalcul, "Articles");
  
      // Générer le fichier Excel et déclencher le téléchargement
      XLSX.writeFile(classeur, "liste_articles.xlsx");
      
      // Notifier l'utilisateur
      toast.success("Exportation réussie !");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Une erreur est survenue lors de l'exportation");
    }
  };

  // 1. Improved file handling function
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Vérifier si le fichier est bien un Excel ou CSV
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setImportError('Veuillez sélectionner un fichier Excel (.xlsx, .xls) ou CSV');
      return;
    }
  
    setImportFileName(file.name);
    setImportError('');
    setLoading(true);
     
    // Lire le fichier
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Prendre la première feuille du classeur
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir la feuille en JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: "", // Valeur par défaut pour les cellules vides
          blankrows: false // Ignorer les lignes vides
        });
        
        console.log("Données importées brutes:", jsonData);
        
        // Traiter les données pour correspondre au format requis par le modèle Article
        const processedData = jsonData.map(row => {
          // Traiter les noms de colonnes possibles 
          const designationValue = row.Désignation || row.Designation || row.designation || row.DESIGNATION || row["Désignation"] || "";
          const referenceValue = row.Référence || row.Reference || row.reference || row.REFERENCE || row["Référence"] || "";
          const descriptionValue = row.Description || row.description || row.DESCRIPTION || "";
          const noteValue = row.Note || row.note || row.NOTE || "Standard"; // Valeur par défaut pour note
          
          // Gérer différents formats de TVA et convertir au format de l'énumération
          let tvaValue = row.TVA || row.Tva || row.tva || row.TVA_TAUX || row["Taux TVA"] || "19%";
          
          // Convertir la TVA au format de l'énumération (TVA_X)
          const tvaFormatted = convertTVA(tvaValue);
          
          // Gérer les différents formats de prix
          const prixVenteValue = parseFloatSafe(row.PrixDeVente || row.PrixVente || row["Prix de vente"] || row["Prix Vente"] || row.prix_vente || 0);
          const prixAchatValue = parseFloatSafe(row.PrixDeAchat || row.PrixAchat || row["Prix d'achat"] || row["Prix Achat"] || row.prix_achat || 0);
          
          // S'assurer que description et note ne sont jamais vides (contrainte @NotEmpty)
          const safeDescription = descriptionValue.trim() || "Description non spécifiée";
          const safeNote = noteValue.trim() || "Note standard";
  
          return {
            designation: designationValue.trim(),
            reference: referenceValue.trim(),
            description: safeDescription,
            tva: tvaFormatted,    // Attention: utiliser "TVA" majuscule pour correspondre au modèle Java
            prixVente: prixVenteValue,
            prixAchat: prixAchatValue,
            note: safeNote
          };
        });
        
        // Filtrer les entrées invalides (vérifier que les champs obligatoires sont présents)
        const validData = processedData.filter(item => 
          item.designation && item.designation.length > 0 &&
          item.reference && item.reference.length > 0 &&
          item.description && item.description.length > 0 &&
          item.note && item.note.length > 0 &&
          item.prixVente > 0 &&
          item.prixAchat > 0
        );
        
        if (validData.length === 0) {
          setImportError("Aucune donnée valide trouvée dans le fichier. Vérifiez le format du fichier.");
          toast.error("Aucune donnée valide trouvée dans le fichier.")
          setLoading(false);
          return;
        }
        
        console.log("Données importées traitées:", validData);
        
        setImportData(validData);
        setShowImportModal(true);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la lecture du fichier:", err);
        setImportError('Erreur lors de la lecture du fichier: ' + err.message);
        setLoading(false);
      }
    };
    
    reader.onerror = (err) => {
      console.error("Erreur FileReader:", err);
      setImportError('Erreur lors de la lecture du fichier');
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  
  // Fonction utilitaire pour convertir en nombre à virgule flottante
  const parseFloatSafe = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    
    // Si c'est déjà un nombre, le retourner
    if (typeof value === 'number') return value;
    
    // Si c'est une chaîne, la nettoyer et la convertir
    if (typeof value === 'string') {
      // Remplacer la virgule par un point et enlever les symboles de devise
      const cleanValue = value.replace(/[^\d.,\-]/g, '').replace(',', '.');
      const result = parseFloat(cleanValue);
      return isNaN(result) ? 0 : result;
    }
    
    return 0;
  };
  
  // Fonction améliorée pour valider et enregistrer les articles importés
  const handleImportSubmit = async () => {
    if (importData.length === 0) {
      setImportError("Aucune donnée à importer");
      return;
    }
  
    try {
      // Afficher un indicateur de chargement
      setLoading(true);
      toast.info(`Importation de ${importData.length} articles en cours...`);
      
      // Collecter les références pour vérifier les doublons avant l'importation
      const existingReferences = new Set();
      let successCount = 0;
      let errorCount = 0;
      let errorMessages = [];
      
      // Parcourir les articles un par un pour mieux gérer les erreurs
      for (let i = 0; i < importData.length; i++) {
        const article = importData[i];
        
        try {
          // Vérifier si la référence est unique dans le lot à importer
          if (existingReferences.has(article.reference)) {
            throw new Error(`Référence "${article.reference}" en doublon dans le fichier à importer`);
          }
          existingReferences.add(article.reference);
          
          // Vérification des contraintes du modèle
          if (!article.designation || article.designation.length === 0) {
            throw new Error(`La désignation est obligatoire (article #${i+1})`);
          }
          
          if (!article.reference || article.reference.length === 0) {
            throw new Error(`La référence est obligatoire (article #${i+1})`);
          }
          
          if (!article.description || article.description.length === 0) {
            throw new Error(`La description est obligatoire (article #${i+1})`);
          }
          
          if (!article.note || article.note.length === 0) {
            throw new Error(`La note est obligatoire (article #${i+1})`);
          }
          
          if (article.prixVente <= 0) {
            throw new Error(`Le prix de vente doit être positif (article #${i+1})`);
          }
          
          if (article.prixAchat < 0) {
            throw new Error(`Le prix d'achat ne peut pas être négatif (article #${i+1})`);
          }
          
          // Vérifier que TVA est une valeur acceptée
          const validTVAValues = ["TVA_19", "TVA_13", "TVA_7", "TVA_0"];
          if (!validTVAValues.includes(article.tva)) {
            throw new Error(`La valeur TVA '${article.tva}' n'est pas valide (article #${i+1})`);
          }
          
          // Préparer les données pour l'envoi
          const articleData = {
            designation: article.designation,
            reference: article.reference,
            description: article.description,
            tva: article.tva,
            prixVente: article.prixVente,
            prixAchat: article.prixAchat,
            note: article.note,
            accountId: accountId // AJOUT: Inclure l'accountId pour chaque article importé
          };
          
          // Envoyer la requête au serveur
          await axios.post("http://localhost:8080/articles", articleData);
          successCount++;
        } catch (err) {
          errorCount++;
          
          // Extraire le message d'erreur du serveur s'il existe
          let errorMsg = "";
          if (err.response && err.response.data) {
            // Pour les erreurs provenant du serveur
            if (typeof err.response.data === 'string') {
              errorMsg = `Article '${article.reference}': ${err.response.data}`;
            } else if (err.response.data.message) {
              errorMsg = `Article '${article.reference}': ${err.response.data.message}`;
            } else {
              errorMsg = `Article '${article.reference}': Erreur ${err.response.status}`;
            }
            
            // Vérifier si l'erreur est liée à un champ unique en doublon dans la base de données
            const responseDataStr = typeof err.response.data === 'string' 
              ? err.response.data 
              : JSON.stringify(err.response.data);
              
            if (err.response.status === 400 && 
                (responseDataStr.includes('unique') || 
                 responseDataStr.includes('contrainte') ||
                 responseDataStr.includes('duplicate'))) {
                
              // Déterminer quel champ unique pose problème
              if (responseDataStr.includes('reference')) {
                errorMsg = `Article '${article.reference}': Cette référence existe déjà dans la base de données`;
              } else {
                errorMsg = `Article '${article.reference}': Une contrainte d'unicité n'est pas respectée`;
              }
              toast.error(errorMsg);
            }
          } else {
            // Pour les erreurs de validation locale
            errorMsg = err.message || `Erreur pour l'article '${article.reference}'`;
          }
          
          console.error("Erreur lors de l'importation:", errorMsg);
          errorMessages.push(errorMsg);
        }
      }
      
      // Stocker les messages d'erreur si nécessaire
      if (errorMessages.length > 0) {
        console.log("Détails des erreurs:", errorMessages);
        if (typeof setImportErrors === 'function') {
          setImportErrors(errorMessages);
        }
      }
      
      // Rafraîchir la liste des articles
      fetchArticles();
      
      // Afficher un message de succès ou d'erreur
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} article(s) importé(s) avec succès`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.warning(`${successCount} article(s) importé(s) avec succès, ${errorCount} article(s) non importé(s)`);
        
        // Proposer d'afficher les détails des erreurs
        if (errorMessages.length > 0 && typeof setShowErrorDetailsModal === 'function') {
          setShowErrorDetailsModal(true);
        }
      } else {
        toast.error("Aucun article n'a pu être importé");
      }
      
      // Fermer le modal d'importation
      setShowImportModal(false);
      setImportData([]);
      setImportFileName("");
      setImportError("");
    } catch (err) {
      console.error("Erreur globale lors de l'importation:", err);
      toast.error("Une erreur est survenue lors de l'importation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="articles-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="articles-card">
        <div className="articles-header">
          <h1 className="articles-title">Liste des Articles</h1>
          <div className="header-buttons">
            {/* Bouton pour exporter */}
            <button
              onClick={exporterVersExcel}
              className="export-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="export-icon">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Exporter
            </button>
            
            {/* Nouveau bouton pour importer */}
            <button
              onClick={openFileSelector}
              className="import-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="import-icon">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
              </svg>
              Importer
            </button>
            
            {/* Input caché pour le sélecteur de fichier */}
            <input
              id="fileImport"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            <button
              onClick={handleAddArticle}
              className="add-article-btn"
            >
              Ajouter un Article
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="articles-filters">
          <div className="filter-group">
            <label className="filter-label">Désignation</label>
            <input
              type="text"
              name="designation"
              value={filters.designation}
              onChange={handleFilterChange}
              placeholder="Rechercher par désignation"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Référence</label>
            <input
              type="text"
              name="reference"
              value={filters.reference}
              onChange={handleFilterChange}
              placeholder="Rechercher par référence"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Prix minimum</label>
            <input
              type="number"
              name="minPrixVente"
              value={filters.minPrixVente}
              onChange={handleFilterChange}
              placeholder="Min prix de vente"
              className="filter-input"
              min="0"
              step="0.01"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">TVA</label>
            <select
              name="tva"
              value={filters.tva}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">Toutes les TVA</option>
              <option value="TVA_19">19%</option>
              <option value="TVA_13">13%</option>
              <option value="TVA_7">7%</option>
              <option value="TVA_0">0%</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="articles-table-container">
          <table className="articles-table">
            <thead className="articles-table-head">
              <tr>
                {['Désignation', 'Référence', 'Prix Vente', 'Prix Achat', 'TVA', 'Note', 'Actions'].map((header, idx) => (
                  <th key={idx} className="articles-table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="articles-table-body">
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Chargement des articles...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="error-message">
                    {error}
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">
                    Aucun article ne correspond aux critères de recherche
                  </td>
                </tr>
              ) : (
                currentArticles.map(article => (
                  <tr key={article.id} className="articles-table-row">
                    <td className="articles-table-cell cell-designation">{article.designation}</td>
                    <td className="articles-table-cell cell-text">{article.reference}</td>
                    <td className="articles-table-cell cell-price">{article.prixVente?.toFixed(2)} TND</td>
                    <td className="articles-table-cell cell-price">{article.prixAchat?.toFixed(2)} TND</td>
                    <td className="articles-table-cell cell-text">{formatTVA(article.tva)}</td>
                    <td className="articles-table-cell cell-text">{article.note || '-'}</td>
                    <td className="articles-table-cell articles-action-buttons">
                      <button
                        onClick={() => handleViewDetails(article)}
                        className="action-button view-button"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="action-button delete-button"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        {!loading && !error && filteredArticles.length > 0 && (
          <Pagination
            pages={pages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Modal pour ajouter/modifier un article */}
      {showModal && (
  <div className="modal-overlay">
    <div className="modal-backdrop" onClick={closeModal}></div>
    
    <div className="modal-container">
      <div className="modal-header">
        <h2 className="modal-title">
          {editMode ? "Modifier l'article" : "Ajouter un nouvel article"}
        </h2>
        <button
          onClick={closeModal}
          className="modal-close-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="modal-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Désignation</label>
              <input
                type="text"
                name="designation"
                value={currentArticle.designation}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Référence</label>
              <input
                type="text"
                name="reference"
                value={currentArticle.reference}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Prix de vente</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.01"
                  name="prixVente"
                  value={currentArticle.prixVente}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <span className="input-suffix">TND</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Prix d'achat</label>
              <div className="input-with-suffix">
                <input
                  type="number"
                  step="0.01"
                  name="prixAchat"
                  value={currentArticle.prixAchat}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
                <span className="input-suffix">TND</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">TVA</label>
              <select
                name="tva"
                value={currentArticle.tva}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="TVA_19">19%</option>
                <option value="TVA_13">13%</option>
                <option value="TVA_7">7%</option>
                <option value="TVA_0">0%</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note</label>
              <input
                type="text"
                name="note"
                value={currentArticle.note}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={currentArticle.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={closeModal}
              className="btn btn-cancel"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editMode ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}

{/* Modal pour afficher les détails */}
{showDetailsModal && detailsArticle && (
  <div className="modal-overlay">
    <div className="modal-backdrop" onClick={() => setShowDetailsModal(false)}></div>
    
    <div className="modal-container">
      <div className="modal-header">
        <h2 className="modal-title">Détails de l'article</h2>
        <button
          onClick={() => setShowDetailsModal(false)}
          className="modal-close-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="modal-body">
        <div className="form-grid">
          <div className="detail-group">
            <label className="form-label">Désignation</label>
            <div className="detail-value">{detailsArticle.designation}</div>
          </div>
          <div className="detail-group">
            <label className="form-label">Référence</label>
            <div className="detail-value">{detailsArticle.reference}</div>
          </div>
          <div className="detail-group">
            <label className="form-label">Prix de vente</label>
            <div className="detail-value">{detailsArticle.prixVente?.toFixed(2)} TND</div>
          </div>
          <div className="detail-group">
            <label className="form-label">Prix d'achat</label>
            <div className="detail-value">{detailsArticle.prixAchat?.toFixed(2)} TND</div>
          </div>
          <div className="detail-group">
            <label className="form-label">TVA</label>
            <div className="detail-value">{formatTVA(detailsArticle.tva)}</div>
          </div>
          <div className="detail-group">
            <label className="form-label">Note</label>
            <div className="detail-value">{detailsArticle.note || '-'}</div>
          </div>
          <div className="detail-group form-group-full">
            <label className="form-label">Description</label>
            <div className="detail-value detail-value-multiline">{detailsArticle.description || '-'}</div>
          </div>
        </div>
        
        <div className="modal-footer">
        <button
          onClick={() => setShowDetailsModal(false)}
          className="btn btn-cancel"
        >
          Fermer
        </button>
        <button
          onClick={() => {
            setShowDetailsModal(false);
            handleEdit(detailsArticle);
          }}
          className="btn btn-primary"
        >
          Modifier
        </button>
      </div>
      </div>
    </div>
  </div>
)}
{/* Modal pour l'importation */}
{showImportModal && (
  <div className="modal-overlay">
    <div className="modal-backdrop" onClick={closeImportModal}></div>
    
    <div className="modal-container">
      <div className="modal-header">
        <h2 className="modal-title">Confirmation d'importation</h2>
        <button
          onClick={closeImportModal}
          className="modal-close-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="modal-body">
        {importError ? (
          <div className="import-error">
            {importError}
          </div>
        ) : (
          <>
            <p className="import-info">
              <strong>Fichier importé :</strong> {importFileName}
            </p>
            <p className="import-info">
              <strong>Articles trouvés :</strong> {importData.length}
            </p>
            
            <div className="import-preview">
              <h3 className="preview-title">Aperçu des données</h3>
              <div className="import-table-container">
                <table className="articles-table">
                  <thead className="articles-table-head">
                    <tr>
                      <th className="articles-table-header">Désignation</th>
                      <th className="articles-table-header">Référence</th>
                      <th className="articles-table-header">Prix Vente</th>
                      <th className="articles-table-header">Prix Achat</th>
                      <th className="articles-table-header">TVA</th>
                    </tr>
                  </thead>
                  <tbody className="articles-table-body">
                    {importData.slice(0, 5).map((article, index) => (
                      <tr key={index} className="articles-table-row">
                        <td className="articles-table-cell">{article.designation}</td>
                        <td className="articles-table-cell">{article.reference}</td>
                        <td className="articles-table-cell">{article.prixVente?.toFixed(2)} TND</td>
                        <td className="articles-table-cell">{article.prixAchat?.toFixed(2)} TND</td>
                        <td className="articles-table-cell">{formatTVA(article.tva)}</td>
                      </tr>
                    ))}
                    {importData.length > 5 && (
                      <tr className="articles-table-row">
                        <td colSpan="5" className="articles-table-cell text-center">
                          ... et {importData.length - 5} autres articles
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        <div className="modal-footer">
          <button
            type="button"
            onClick={closeImportModal}
            className="btn btn-cancel"
          >
            Annuler
          </button>
          {!importError && (
            <button
              type="button"
              onClick={handleImportSubmit}
              className="btn btn-primary"
              disabled={importData.length === 0}
            >
              Importer {importData.length} article(s)
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
</div>

);
};

export default Articles;