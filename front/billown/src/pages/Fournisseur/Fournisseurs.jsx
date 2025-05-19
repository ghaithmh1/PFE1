import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Fournisseurs.css";
import Pagination from "../../components/pagination/pagination";
import * as XLSX from 'xlsx';
import { useAccountId } from '../../hooks/useAccountId';



const POST_PER_PAGE = 5;

const Fournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [importError, setImportError] = useState("");
  const [currentFournisseur, setCurrentFournisseur] = useState({
    id: null,
    nom: "",
    identifiant: "",
    matriculeFiscale: "",
    tel: "",
    fax: "",
    email: "",
    pays: "",
    adresse: "",
    codePostal: ""
  });
  const [detailsFournisseur, setDetailsFournisseur] = useState(null);
  const [filters, setFilters] = useState({
    nom: "",
    identifiant: "",
    matriculeFiscale: "",
    email: ""
  });
  const [currentPage, setCurrentPage] = useState(1);

    const accountId = useAccountId();

  useEffect(() => {
      if (accountId) {
        fetchFournisseurs();
      }
    }, [accountId]);

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/fournisseurs/account/${accountId}`);
      if(response.data){
        setFournisseurs(response.data);
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

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

  const validateForm = () => {
    if (!currentFournisseur.nom.trim()) {
      toast.error("Le nom du fournisseur ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.identifiant.trim()) {
      toast.error("L'identifiant ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.matriculeFiscale.trim()) {
      toast.error("Le matricule fiscal ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.tel.trim()) {
      toast.error("Le téléphone ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.email.trim()) {
      toast.error("L'email ne peut pas être vide");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentFournisseur.email)) {
      toast.error("Veuillez entrer un email valide");
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFournisseur(prev => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setCurrentPage(1); // Réinitialiser à la première page lors du filtrage
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      const articleToSend = { 
        ...currentFournisseur,
        accountId: accountId 
       };
      
       if (editMode && currentArticle.id) {
        await axios.put(
          `http://localhost:8080/fournisseurs/${currentArticle.id}/account/${accountId}`,
          articleToSend
        );
        toast.success("Fournisseur mis à jour avec succès");
      } else {
        await axios.post(
          "http://localhost:8080/fournisseurs",
          articleToSend
        );
        toast.success("Fournisseur ajouté avec succès");
      }
      fetchFournisseurs();
      closeModal();
    } catch (err) {
      handleApiError(err, "Erreur lors de l'enregistrement du fournisseur");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur?")) {
      try {
        await axios.delete(`http://localhost:8080/fournisseurs/${id}/account/${accountId}`);
        toast.success("Fournisseur supprimé avec succès");
        fetchFournisseurs();
      } catch (err) {
                if (err.response && err.response.status === 500 && 
                    err.response.data?.includes("utilisé dans une ou plusieurs factures")) {
                  toast.error("Impossible de supprimer : fournisseur utilisé dans des factures");
                } else {
                  // Gestion des autres erreurs
                  handleApiError(err, "Erreur lors de la suppression du fournisseur");
                }
      }
    }
  };

  const handleViewDetails = (fournisseur) => {
    setDetailsFournisseur(fournisseur);
    setShowDetailsModal(true);
  };

  const handleEdit = (fournisseur) => {
    setCurrentFournisseur(fournisseur);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentFournisseur({
      id: null,
      nom: "",
      identifiant: "",
      matriculeFiscale: "",
      tel: "",
      fax: "",
      email: "",
      pays: "",
      adresse: "",
      codePostal: ""
    });
    setEditMode(false);
  };

  const handleAddFournisseur = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredFournisseurs = fournisseurs.filter(fournisseur => {
    const matchesNom = filters.nom 
      ? fournisseur.nom.toLowerCase().includes(filters.nom.toLowerCase())
      : true;
    const matchesIdentifiant = filters.identifiant
      ? fournisseur.identifiant.toLowerCase().includes(filters.identifiant.toLowerCase())
      : true;
    const matchesMatricule = filters.matriculeFiscale
      ? fournisseur.matriculeFiscale.toLowerCase().includes(filters.matriculeFiscale.toLowerCase())
      : true;
    const matchesEmail = filters.email
      ? fournisseur.email.toLowerCase().includes(filters.email.toLowerCase())
      : true;

    return matchesNom && matchesIdentifiant && matchesMatricule && matchesEmail;
  });

  // Pagination
  const pages = Math.ceil(filteredFournisseurs.length / POST_PER_PAGE);
  const indexOfLastFournisseur = currentPage * POST_PER_PAGE;
  const indexOfFirstFournisseur = indexOfLastFournisseur - POST_PER_PAGE;
  const currentFournisseurs = filteredFournisseurs.slice(indexOfFirstFournisseur, indexOfLastFournisseur);

  const exporterVersExcel = () => {
      try {
        // Créer un nouveau classeur
        const classeur = XLSX.utils.book_new();
        
        // Transformer les données en format pour worksheet
        const donneesPourExcel = fournisseurs.map(client => ({
          Identifiant: client.identifiant || "",
          Nom: client.nom || "",
          Email: client.email || "",
          Adresse: client.adresse || "",
          CodePostal: client.codePostal || "",
          Téléphone: client.tel || "",
          Pays: client.pays || ""
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
        XLSX.utils.book_append_sheet(classeur, feuilleDeCalcul, "Fournisseurs");
    
        // Générer le fichier Excel et déclencher le téléchargement
        XLSX.writeFile(classeur, "liste_fournisseurs.xlsx");
        
        // Notifier l'utilisateur
        toast.success("Exportation réussie !");
      } catch (error) {
        console.error("Erreur lors de l'exportation:", error);
        toast.error("Une erreur est survenue lors de l'exportation");
      }
    };

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
              
              // Traiter les données pour correspondre au format requis par le modèle Fournisseur
              const processedData = jsonData.map(row => {
                  // Traiter les noms de colonnes possibles avec gestion flexible des noms de colonnes
                  const nomValue = row.Nom || row.nom || row.NOM || row["Nom"] || "";
                  const identifiantValue = row.Identifiant || row.identifiant || row.IDENTIFIANT || row["Identifiant"] || "";
                  const matriculeValue = row.Matricule || row.matricule || row.MATRICULE || row["Matricule Fiscale"] || row["Matricule"] || "";
                  const telValue = row.Téléphone || row.Tel || row.tel || row.téléphone || row.telephone || row.TELEPHONE || row["Téléphone"] || "";
                  const faxValue = row.Fax || row.fax || row.FAX || row["Fax"] || "";
                  const emailValue = row.Email || row.email || row.EMAIL || row["Email"] || "";
                  const paysValue = row.Pays || row.pays || row.PAYS || row["Pays"] || "";
                  const adresseValue = row.Adresse || row.adresse || row.ADRESSE || row["Adresse"] || "";
                  const codePostalValue = row.CodePostal || row["Code Postal"] || row.codePostal || row["CodePostal"] || row.CP || row.cp || "";
  
                  return {
                      nom: nomValue.trim(),
                      identifiant: identifiantValue.trim(),
                      matriculeFiscale: String(matriculeValue).trim(),
                      tel: String(telValue).trim(),
                      fax: String(faxValue).trim(),    
                      email: emailValue.trim(),
                      pays: paysValue.trim(),
                      adresse: adresseValue.trim(),
                      codePostal: codePostalValue.trim()
                  };
              });
              
              
              const validData = processedData.filter(item => {
                // Vérification plus souple des champs obligatoires
                // Vérifier que les champs essentiels sont présents, même s'ils sont vides
                const hasNom = item.nom && item.nom.trim().length > 0;
                const hasIdentifiant = item.identifiant && item.identifiant.trim().length > 0;
                const hasMatricule = item.matriculeFiscale && item.matriculeFiscale.trim().length > 0;
                const hasTel = item.tel && item.tel.toString().trim().length > 0;
                const hasEmail = item.email && item.email.trim().length > 0;
                const validEmail = hasEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) : false;
                
                // Afficher des logs pour le débogage
                console.log(`Validation de l'entrée: ${item.nom} (${item.identifiant})`);
                console.log(`Nom: ${hasNom}, ID: ${hasIdentifiant}, Matricule: ${hasMatricule}, Tel: ${hasTel}, Email: ${hasEmail}, Email valide: ${validEmail}`);
                
                // Retourne true uniquement si tous les champs essentiels sont présents
                return hasNom && hasIdentifiant && hasMatricule && hasTel && hasEmail && validEmail;
              });

            // Ajouter après la validation pour remplir les champs manquants avec des valeurs par défaut
            const normalizedData = validData.map(item => {
              return {
                  ...item,
                  // Utiliser les valeurs existantes ou des valeurs par défaut pour les champs optionnels
                  fax: item.fax || "Non spécifié",
                  pays: item.pays || "Non spécifié", 
                  adresse: item.adresse || "Non spécifié",
                  codePostal: item.codePostal || "Non spécifié"
              };
            });

            // Si vous avez des données valides après normalisation, continuez
            if (normalizedData.length > 0) {
              console.log("Données valides après traitement:", normalizedData);
              setImportData(normalizedData);
              setShowImportModal(true);
            } else {
              setImportError("Aucune donnée valide trouvée dans le fichier. Vérifiez le format du fichier et assurez-vous que les champs obligatoires sont présents.");
              toast.error("Aucune donnée valide trouvée dans le fichier.");
            }
            
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

  const handleImportSubmit = async () => {
    if (importData.length === 0) {
        setImportError("Aucune donnée à importer");
        return;
    }

    try {
        // Afficher un indicateur de chargement
        setLoading(true);
        toast.info(`Importation de ${importData.length} fournisseurs en cours...`);
        
        // Collecter les identifiants pour vérifier les doublons avant l'importation
        const existingIdentifiers = new Set();
        let successCount = 0;
        let errorCount = 0;
        let errorMessages = [];
        
        // Parcourir les fournisseurs un par un pour mieux gérer les erreurs
        for (let i = 0; i < importData.length; i++) {
            const fournisseur = importData[i];
            
            try {
                // Vérifier si l'identifiant est unique dans le lot à importer
                if (existingIdentifiers.has(fournisseur.identifiant)) {
                    throw new Error(`Identifiant "${fournisseur.identifiant}" en doublon dans le fichier à importer`);
                }
                existingIdentifiers.add(fournisseur.identifiant);
                
                // Vérification des contraintes du modèle
                if (!fournisseur.nom || fournisseur.nom.length === 0) {
                    throw new Error(`Le nom est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.identifiant || fournisseur.identifiant.length === 0) {
                    throw new Error(`L'identifiant est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.matriculeFiscale || fournisseur.matriculeFiscale.length === 0) {
                    throw new Error(`Le matricule fiscal est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.tel || fournisseur.tel.length === 0) {
                    throw new Error(`Le téléphone est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.email || fournisseur.email.length === 0) {
                    throw new Error(`L'email est obligatoire (fournisseur #${i+1})`);
                }
                
                // Vérifier le format de l'email
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fournisseur.email)) {
                    throw new Error(`L'email "${fournisseur.email}" n'est pas valide (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.pays || fournisseur.pays.length === 0) {
                    throw new Error(`Le pays est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.adresse || fournisseur.adresse.length === 0) {
                    throw new Error(`L'adresse est obligatoire (fournisseur #${i+1})`);
                }
                
                if (!fournisseur.codePostal || fournisseur.codePostal.length === 0) {
                    throw new Error(`Le code postal est obligatoire (fournisseur #${i+1})`);
                }
                
                // Préparer les données pour l'envoi (avec fax optionnel)
                const fournisseurData = {
                    nom: fournisseur.nom,
                    identifiant: fournisseur.identifiant,
                    matriculeFiscale: fournisseur.matriculeFiscale,
                    tel: fournisseur.tel,
                    fax: fournisseur.fax || "", 
                    email: fournisseur.email,
                    pays: fournisseur.pays,
                    adresse: fournisseur.adresse,
                    codePostal: fournisseur.codePostal,
                    accountId: accountId // AJOUT: Inclure l'accountId pour chaque fournisseur importé
                };
                
                // Envoyer la requête au serveur
                await axios.post("http://localhost:8080/fournisseurs", fournisseurData);
                successCount++;
            } catch (err) {
                errorCount++;
                
                // Extraire le message d'erreur du serveur s'il existe
                let errorMsg = "";
                if (err.response && err.response.data) {
                    // Pour les erreurs provenant du serveur
                    if (typeof err.response.data === 'string') {
                        errorMsg = `Fournisseur '${fournisseur.identifiant}': ${err.response.data}`;
                    } else if (err.response.data.message) {
                        errorMsg = `Fournisseur '${fournisseur.identifiant}': ${err.response.data.message}`;
                    } else {
                        errorMsg = `Fournisseur '${fournisseur.identifiant}': Erreur ${err.response.status}`;
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
                        if (responseDataStr.includes('identifiant')) {
                            errorMsg = `Fournisseur '${fournisseur.identifiant}': Cet identifiant existe déjà dans la base de données`;
                        } else if (responseDataStr.includes('tel')) {
                            errorMsg = `Fournisseur '${fournisseur.identifiant}': Ce numéro de téléphone existe déjà dans la base de données`;
                        } else if (responseDataStr.includes('email')) {
                            errorMsg = `Fournisseur '${fournisseur.identifiant}': Cet email existe déjà dans la base de données`;
                        } else if (responseDataStr.includes('matriculeFiscale')) {
                            errorMsg = `Fournisseur '${fournisseur.identifiant}': Ce matricule fiscal existe déjà dans la base de données`;
                        } else {
                            errorMsg = `Fournisseur '${fournisseur.identifiant}': Une contrainte d'unicité n'est pas respectée`;
                        }
                        toast.error(errorMsg);
                    }
                } else {
                    // Pour les erreurs de validation locale
                    errorMsg = err.message || `Erreur pour le fournisseur '${fournisseur.identifiant}'`;
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
        
        // Rafraîchir la liste des fournisseurs
        fetchFournisseurs();
        
        // Afficher un message de succès ou d'erreur
        if (successCount > 0 && errorCount === 0) {
            toast.success(`${successCount} fournisseur(s) importé(s) avec succès`);
        } else if (successCount > 0 && errorCount > 0) {
            toast.warning(`${successCount} fournisseur(s) importé(s) avec succès, ${errorCount} fournisseur(s) non importé(s)`);
            
            // Proposer d'afficher les détails des erreurs
            if (errorMessages.length > 0 && typeof setShowErrorDetailsModal === 'function') {
                setShowErrorDetailsModal(true);
            }
        } else {
            toast.error("Aucun fournisseur n'a pu être importé");
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

const openFileSelector = () => {
  document.getElementById('fileImport').click();
};

  return (
    <div className="fournisseurs-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="fournisseurs-card">
        <div className="fournisseurs-header">
          <h1 className="fournisseurs-title">Liste des Fournisseurs</h1>

          <div className="header-buttons">
    <button
        onClick={exporterVersExcel}
        className="export-btn"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="export-icon">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Exporter
    </button>
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
        onClick={handleAddFournisseur}
        className="add-fournisseur-btn"
    >
        Ajouter un Fournisseur
    </button>
</div>
        </div>

        {/* Filtres */}
        <div className="fournisseurs-filters">
          <div className="filter-group">
            <label className="filter-label">Nom</label>
            <input
              type="text"
              name="nom"
              value={filters.nom}
              onChange={handleFilterChange}
              placeholder="Rechercher par nom"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Identifiant</label>
            <input
              type="text"
              name="identifiant"
              value={filters.identifiant}
              onChange={handleFilterChange}
              placeholder="Rechercher par identifiant"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Matricule Fiscale</label>
            <input
              type="text"
              name="matriculeFiscale"
              value={filters.matriculeFiscale}
              onChange={handleFilterChange}
              placeholder="Rechercher par matricule"
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Email</label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleFilterChange}
              placeholder="Rechercher par email"
              className="filter-input"
            />
          </div>
        </div>

        {/* Tableau */}
        <div className="fournisseurs-table-container">
          <table className="fournisseurs-table">
            <thead className="fournisseurs-table-head">
              <tr>
                {['Nom', 'Identifiant', 'Matricule Fiscale', 'Téléphone', 'Email', 'Actions'].map((header, idx) => (
                  <th key={idx} className="fournisseurs-table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="fournisseurs-table-body">
              {loading ? (
                <tr>
                  <td colSpan="6" className="loading-container">
                    <div className="spinner"></div>
                    <p className="loading-text">Chargement des fournisseurs...</p>
                  </td>
                </tr>
              ) : filteredFournisseurs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-message">
                    Aucun fournisseur ne correspond aux critères de recherche
                  </td>
                </tr>
              ) : (
                currentFournisseurs.map(fournisseur => (
                  <tr key={fournisseur.id} className="fournisseurs-table-row">
                    <td className="fournisseurs-table-cell cell-nom">{fournisseur.nom}</td>
                    <td className="fournisseurs-table-cell cell-text">{fournisseur.identifiant}</td>
                    <td className="fournisseurs-table-cell cell-text">{fournisseur.matriculeFiscale}</td>
                    <td className="fournisseurs-table-cell cell-text">{fournisseur.tel}</td>
                    <td className="fournisseurs-table-cell cell-text">{fournisseur.email}</td>
                    <td className="fournisseurs-table-cell fournisseurs-action-buttons">
                      <button
                        onClick={() => handleViewDetails(fournisseur)}
                        className="action-button view-button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(fournisseur.id)}
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
        {!loading && filteredFournisseurs.length > 0 && (
          <Pagination
            pages={pages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>

      {/* Modal pour ajouter/modifier un fournisseur */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={closeModal}></div>
          
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">
                {editMode ? "Modifier le fournisseur" : "Ajouter un nouveau fournisseur"}
              </h2>
              <button
                onClick={closeModal}
                className="modal-close-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="fournisseur-form" noValidate>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={currentFournisseur.nom}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Identifiant
                    </label>
                    <input
                      type="text"
                      name="identifiant"
                      value={currentFournisseur.identifiant}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Matricule Fiscale
                    </label>
                    <input
                      type="text"
                      name="matriculeFiscale"
                      value={currentFournisseur.matriculeFiscale}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      name="tel"
                      value={currentFournisseur.tel}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Fax
                    </label>
                    <input
                      type="text"
                      name="fax"
                      value={currentFournisseur.fax}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={currentFournisseur.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="pays"
                      value={currentFournisseur.pays}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      name="codePostal"
                      value={currentFournisseur.codePostal}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={currentFournisseur.adresse}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="2"
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
      {showDetailsModal && detailsFournisseur && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={() => setShowDetailsModal(false)}></div>
          
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">Détails du fournisseur</h2>
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
                  <label className="form-label">Nom</label>
                  <div className="detail-value">{detailsFournisseur.nom}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Identifiant</label>
                  <div className="detail-value">{detailsFournisseur.identifiant}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Matricule Fiscale</label>
                  <div className="detail-value">{detailsFournisseur.matriculeFiscale}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Téléphone</label>
                  <div className="detail-value">{detailsFournisseur.tel}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Fax</label>
                  <div className="detail-value">{detailsFournisseur.fax || '-'}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Email</label>
                  <div className="detail-value">{detailsFournisseur.email}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Pays</label>
                  <div className="detail-value">{detailsFournisseur.pays || '-'}</div>
                </div>
                <div className="detail-group">
                  <label className="form-label">Code Postal</label>
                  <div className="detail-value">{detailsFournisseur.codePostal || '-'}</div>
                </div>
                <div className="detail-group full-width">
                  <label className="form-label">Adresse</label>
                  <div className="detail-value detail-value-multiline">{detailsFournisseur.adresse || '-'}</div>
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
                    handleEdit(detailsFournisseur);
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
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}></div>
        
        <div className="modal-container">
            <div className="modal-header">
                <h2 className="modal-title">Confirmation d'importation</h2>
                <button
                    onClick={() => setShowImportModal(false)}
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
                            <strong>Fournisseurs trouvés :</strong> {importData.length}
                        </p>
                        
                        <div className="import-preview">
                            <h3 className="preview-title">Aperçu des données</h3>
                            <div className="import-table-container">
                                <table className="fournisseurs-table">
                                    <thead className="fournisseurs-table-head">
                                        <tr>
                                            <th className="fournisseurs-table-header">Nom</th>
                                            <th className="fournisseurs-table-header">Identifiant</th>
                                            <th className="fournisseurs-table-header">Matricule Fiscale</th>
                                            <th className="fournisseurs-table-header">Téléphone</th>
                                            <th className="fournisseurs-table-header">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="fournisseurs-table-body">
                                        {importData.slice(0, 5).map((fournisseur, index) => (
                                            <tr key={index} className="fournisseurs-table-row">
                                                <td className="fournisseurs-table-cell">{fournisseur.nom}</td>
                                                <td className="fournisseurs-table-cell">{fournisseur.identifiant}</td>
                                                <td className="fournisseurs-table-cell">{fournisseur.matriculeFiscale}</td>
                                                <td className="fournisseurs-table-cell">{fournisseur.tel}</td>
                                                <td className="fournisseurs-table-cell">{fournisseur.email}</td>
                                            </tr>
                                        ))}
                                        {importData.length > 5 && (
                                            <tr className="fournisseurs-table-row">
                                                <td colSpan="5" className="fournisseurs-table-cell text-center">
                                                    ... et {importData.length - 5} autres fournisseurs
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
                        onClick={() => setShowImportModal(false)}
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
                            Importer {importData.length} fournisseur(s)
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

export default Fournisseurs;