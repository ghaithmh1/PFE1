import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import ClientDetail from "./clientDetail"; 
import "./Clients.css";
import Pagination from "../../components/pagination/pagination";
import * as XLSX from 'xlsx';
import { useAccountId } from '../../hooks/useAccountId';



const POST_PER_PAGE = 5;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // Nouveau state pour le modal d'importation
    const [importData, setImportData] = useState([]); // Stocker les données importées
    const [importFileName, setImportFileName] = useState(""); // Nom du fichier importé
    const [importError, setImportError] = useState(""); // Erreur d'importation
  const [editMode, setEditMode] = useState(false);
  const [currentClient, setCurrentClient] = useState({
    id: null,
    nom: "",
    identifiant: "",
    tel: "",
    fax: "",
    email: "",
    pays: "",
    adresse: "",
    codePostal: ""
  });
  const [detailsClient, setDetailsClient] = useState(null);
  const [filters, setFilters] = useState({
    nom: "",
    identifiant: "",
    email: "",
    pays: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
    
  const accountId = useAccountId();
  
  
  useEffect(() => {
    if (accountId) {
      fetchClients();
    }
  }, [accountId]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/clients/account/${accountId}`);
      if(response.data && response.data.data){
        setClients(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gérer les erreurs API de manière centralisée
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état en dehors de 2xx
      switch (error.response.status) {
        case 400:
          if (error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
          } else {
            toast.error("Données invalides");
          }
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
      // La requête a été faite mais aucune réponse n'a été reçue
      toast.error("Impossible de se connecter au serveur");
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      toast.error("Erreur de configuration de la requête");
    }
  };

  // Valider le formulaire
  const validateForm = () => {
    // Validation du nom
    if (!currentClient.nom.trim()) {
      toast.error("Le nom du client ne peut pas être vide");
      return false;
    }
    
    // Validation de l'identifiant
    if (!currentClient.identifiant.trim()) {
      toast.error("L'identifiant ne peut pas être vide");
      return false;
    }
    
    // Validation du téléphone
    if (!currentClient.tel.trim()) {
      toast.error("Le téléphone ne peut pas être vide");
      return false;
    }
    
    // Validation de l'email
    if (!currentClient.email.trim()) {
      toast.error("L'email ne peut pas être vide");
      return false;
    }
    
    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentClient.email)) {
      toast.error("Veuillez entrer un email valide");
      return false;
    }
    
    return true;
  };

  // Gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentClient({
      ...currentClient,
      [name]: value
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
      const clientToSend = {
        ...currentClient,
        accountId: accountId
      };
      
      if (editMode && currentClient.id) {
        // Avant d'envoyer la requête
        console.log("Données envoyées:", clientToSend);
        await axios.put(
          `http://localhost:8080/clients/${currentClient.id}/account/${accountId}`, 
          clientToSend
        );
        toast.success("Client mis à jour avec succès");
      } else {
        await axios.post(
          "http://localhost:8080/clients", 
          clientToSend
        );
        toast.success("Client ajouté avec succès");
      }
      
      fetchClients();
      closeModal();
    } catch (err) {
      handleApiError(err, "Erreur lors de l'enregistrement du client");
    }
  };

  // Supprimer un client
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client?")) {
      try {
        await axios.delete(`http://localhost:8080/clients/${id}/account/${accountId}`);
        toast.success("Client supprimé avec succès");
        fetchClients();
      } catch (err) {
                if (err.response && err.response.status === 500 && 
                    err.response.data?.includes("utilisé dans une ou plusieurs factures")) {
                  toast.error("Impossible de supprimer : client utilisé dans des factures");
                } else {
                  // Gestion des autres erreurs
                  handleApiError(err, "Erreur lors de la suppression du client");
                }
      }
    }
  };

  // Afficher les détails d'un client
  const handleViewDetails = (client) => {
    setDetailsClient(client);
    setShowDetailsModal(true);
  };

  // Modifier un client
  const handleEdit = (client) => {
    setCurrentClient(client);
    setEditMode(true);
    setShowModal(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCurrentClient({
      id: null,
      nom: "",
      identifiant: "",
      tel: "",
      fax: "",
      email: "",
      pays: "",
      adresse: "",
      codePostal: ""
    });
    setEditMode(false);
  };
  
  // Ouvrir le modal pour ajouter un client
  const handleAddClient = () => {
    resetForm();
    setShowModal(true);
  };
  
  // Fermer le modal
  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Filtrer les clients en fonction des filtres
  const filteredClients = Array.isArray(clients) 
    ? clients.filter(client => {
        const matchesNom = filters.nom 
          ? client.nom.toLowerCase().includes(filters.nom.toLowerCase())
          : true;
        const matchesIdentifiant = filters.identifiant
          ? client.identifiant.toLowerCase().includes(filters.identifiant.toLowerCase())
          : true;
        const matchesEmail = filters.email
          ? client.email.toLowerCase().includes(filters.email.toLowerCase())
          : true;
        const matchesPays = filters.pays
          ? client.pays.toLowerCase().includes(filters.pays.toLowerCase())
          : true;

        return matchesNom && matchesIdentifiant && matchesEmail && matchesPays;
      })
    : [];

  // Pagination
  const pages = Math.ceil(filteredClients.length / POST_PER_PAGE);
  const indexOfLastClient = currentPage * POST_PER_PAGE;
  const indexOfFirstClient = indexOfLastClient - POST_PER_PAGE;
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

  const exporterVersExcel = () => {
    try {
      // Créer un nouveau classeur
      const classeur = XLSX.utils.book_new();
      
      // Transformer les données en format pour worksheet
      const donneesPourExcel = clients.map(client => ({
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
      XLSX.utils.book_append_sheet(classeur, feuilleDeCalcul, "Clients");
  
      // Générer le fichier Excel et déclencher le téléchargement
      XLSX.writeFile(classeur, "liste_clients.xlsx");
      
      // Notifier l'utilisateur
      toast.success("Exportation réussie !");
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast.error("Une erreur est survenue lors de l'exportation");
    }
  };

  // Fonction améliorée pour traiter le fichier Excel/CSV
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
        
        // Traiter les données pour correspondre au format requis par le modèle Client
        const processedData = jsonData.map(row => {
          // Traiter les noms de colonnes possibles avec gestion flexible des noms de colonnes
          const nomValue = row.Nom || row.nom || row.NOM || row["Nom"] || "";
          const identifiantValue = row.Identifiant || row.identifiant || row.IDENTIFIANT || row["Identifiant"] || row.Reference || row.reference || "";
          const telValue = row.Téléphone || row.Tel || row.tel || row.téléphone || row.telephone || row.TELEPHONE || row["Téléphone"] || "";
          const faxValue = row.Fax || row.fax || row.FAX || row["Fax"] || "";
          const emailValue = row.Email || row.email || row.EMAIL || row["Email"] || "";
          const paysValue = row.Pays || row.pays || row.PAYS || row["Pays"] || "";
          const adresseValue = row.Adresse || row.adresse || row.ADRESSE || row["Adresse"] || "";
          const codePostalValue = row.CodePostal || row["Code Postal"] || row.codePostal || row["CodePostal"] || row.CP || row.cp || "";

          return {
            nom: nomValue.trim(),
            identifiant: identifiantValue.trim(),
            tel: String(telValue).trim(),
            fax: String(faxValue).trim(),    
            email: emailValue.trim(),
            pays: paysValue.trim(),
            adresse: adresseValue.trim(),
            codePostal: codePostalValue.trim()
          };
        });
        
        // Filtrer les entrées invalides (vérifier que les champs obligatoires sont présents)
        const validData = processedData.filter(item => 
          item.nom && item.nom.length > 0 &&
          item.identifiant && item.identifiant.length > 0 &&
          item.email && item.email.length > 0 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email)
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

  // Fonction pour valider et enregistrer les clients importés

const handleImportSubmit = async () => {
  if (importData.length === 0) {
      setImportError("Aucune donnée à importer");
      return;
  }

  try {
      // Afficher un indicateur de chargement
      setLoading(true);
      toast.info(`Importation de ${importData.length} clients en cours...`);
      
      // Collecter les identifiants pour vérifier les doublons avant l'importation
      const existingIdentifiers = new Set();
      let successCount = 0;
      let errorCount = 0;
      let errorMessages = [];
      
      // Parcourir les clients un par un pour mieux gérer les erreurs
      for (let i = 0; i < importData.length; i++) {
          const client = importData[i];
          
          try {
              // Vérifier si l'identifiant est unique dans le lot à importer
              if (existingIdentifiers.has(client.identifiant)) {
                  throw new Error(`Identifiant "${client.identifiant}" en doublon dans le fichier à importer`);
              }
              existingIdentifiers.add(client.identifiant);
              
              // Vérification des contraintes du modèle (adapté au nouveau backend)
              if (!client.nom || client.nom.length === 0) {
                  throw new Error(`Le nom est obligatoire (client #${i+1})`);
              }
              
              if (!client.identifiant || client.identifiant.length === 0) {
                  throw new Error(`L'identifiant est obligatoire (client #${i+1})`);
              }
              
              if (!client.tel || client.tel.length === 0) {
                  throw new Error(`Le téléphone est obligatoire (client #${i+1})`);
              }
              
              if (!client.email || client.email.length === 0) {
                  throw new Error(`L'email est obligatoire (client #${i+1})`);
              }
              
              // Vérifier le format de l'email
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
                  throw new Error(`L'email "${client.email}" n'est pas valide (client #${i+1})`);
              }
              
              if (!client.pays || client.pays.length === 0) {
                  throw new Error(`Le pays est obligatoire (client #${i+1})`);
              }
              
              if (!client.adresse || client.adresse.length === 0) {
                  throw new Error(`L'adresse est obligatoire (client #${i+1})`);
              }
              
              if (!client.codePostal || client.codePostal.length === 0) {
                  throw new Error(`Le code postal est obligatoire (client #${i+1})`);
              }
              
              // Préparer les données pour l'envoi (avec fax optionnel)
              const clientData = {
                  nom: client.nom,
                  identifiant: client.identifiant,
                  tel: client.tel,
                  fax: client.fax || "", // Fax optionnel, valeur par défaut vide
                  email: client.email,
                  pays: client.pays,
                  adresse: client.adresse,
                  codePostal: client.codePostal,
                  accountId: accountId // AJOUT: Inclure l'accountId pour chaque client importé
              };
              
              // Envoyer la requête au serveur
              await axios.post("http://localhost:8080/clients", clientData);
              successCount++;
          } catch (err) {
              errorCount++;
              
              // Extraire le message d'erreur du serveur s'il existe
              let errorMsg = "";
              if (err.response && err.response.data) {
                  // Pour les erreurs provenant du serveur
                  if (typeof err.response.data === 'string') {
                      errorMsg = `Client '${client.identifiant}': ${err.response.data}`;
                  } else if (err.response.data.message) {
                      errorMsg = `Client '${client.identifiant}': ${err.response.data.message}`;
                  } else {
                      errorMsg = `Client '${client.identifiant}': Erreur ${err.response.status}`;
                  }
                  
                  // Vérifier si l'erreur est liée à un champ unique en doublon dans la base de données
                  const responseDataStr = typeof err.response.data === 'string' 
                      ? err.response.data 
                      : JSON.stringify(err.response.data);
                      
                  if (err.response.status === 400 && 
                      (responseDataStr.includes('unique') || 
                       responseDataStr.includes('contrainte') ||
                       responseDataStr.includes('duplicate'))) {
                      
                      // Déterminer quel champ unique pose problème (fax n'est plus unique)
                      if (responseDataStr.includes('identifiant')) {
                          errorMsg = `Client '${client.identifiant}': Cet identifiant existe déjà dans la base de données`;
                      } else if (responseDataStr.includes('tel')) {
                          errorMsg = `Client '${client.identifiant}': Ce numéro de téléphone existe déjà dans la base de données`;
                      } else if (responseDataStr.includes('email')) {
                          errorMsg = `Client '${client.identifiant}': Cet email existe déjà dans la base de données`;
                      } else {
                          errorMsg = `Client '${client.identifiant}': Une contrainte d'unicité n'est pas respectée`;
                      }
                      toast.error(errorMsg);
                  }
              } else {
                  // Pour les erreurs de validation locale
                  errorMsg = err.message || `Erreur pour le client '${client.identifiant}'`;
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
      
      // Rafraîchir la liste des clients
      fetchClients();
      
      // Afficher un message de succès ou d'erreur
      if (successCount > 0 && errorCount === 0) {
          toast.success(`${successCount} client(s) importé(s) avec succès`);
      } else if (successCount > 0 && errorCount > 0) {
          toast.warning(`${successCount} client(s) importé(s) avec succès, ${errorCount} client(s) non importé(s)`);
          
          // Proposer d'afficher les détails des erreurs
          if (errorMessages.length > 0 && typeof setShowErrorDetailsModal === 'function') {
              setShowErrorDetailsModal(true);
          }
      } else {
          toast.error("Aucun client n'a pu être importé");
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
    <div className="articles-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="articles-card">
      <div className="articles-header">
      <h1 className="articles-title">Liste des Clients</h1>
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
          onClick={handleAddClient}
          className="add-article-btn"
        >
          Ajouter un Client
        </button>
      </div>
    </div>

        {/* Filtres */}
        <div className="articles-filters">
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
          <div className="filter-group">
            <label className="filter-label">Pays</label>
            <input
              type="text"
              name="pays"
              value={filters.pays}
              onChange={handleFilterChange}
              placeholder="Rechercher par pays"
              className="filter-input"
            />
          </div>
        </div>

        {/* Table */}
        <div className="articles-table-container">
          <table className="articles-table">
            <thead className="articles-table-head">
              <tr>
                {['Nom', 'Identifiant', 'Téléphone', 'Email', 'Pays', 'Actions'].map((header, idx) => (
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
                    <p className="loading-text">Chargement des clients...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="error-message">
                    {error}
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-message">
                    Aucun client ne correspond aux critères de recherche
                  </td>
                </tr>
              ) : (
                currentClients.map(client => (
                  <tr key={client.id} className="articles-table-row">
                    <td className="articles-table-cell cell-designation">{client.nom}</td>
                    <td className="articles-table-cell cell-text">{client.identifiant}</td>
                    <td className="articles-table-cell cell-text">{client.tel}</td>
                    <td className="articles-table-cell cell-text">{client.email}</td>
                    <td className="articles-table-cell cell-text">{client.pays || '-'}</td>
                    <td className="articles-table-cell articles-action-buttons">
                      <button
                        onClick={() => handleViewDetails(client)}
                        className="action-button view-button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    
                      <button
                        onClick={() => handleDelete(client.id)}
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
        {!loading && !error && filteredClients.length > 0 && (
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
                {editMode ? "Modifier le client" : "Ajouter un nouveau client"}
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
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={currentClient.nom}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Identifiant</label>
                    <input
                      type="text"
                      name="identifiant"
                      value={currentClient.identifiant}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input
                      type="text"
                      name="tel"
                      value={currentClient.tel}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fax</label>
                    <input
                      type="text"
                      name="fax"
                      value={currentClient.fax}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={currentClient.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pays</label>
                    <input
                      type="text"
                      name="pays"
                      value={currentClient.pays}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Code Postal</label>
                    <input
                      type="text"
                      name="codePostal"
                      value={currentClient.codePostal}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group form-group-full">
                    <label className="form-label">Adresse</label>
                    <textarea
                      name="adresse"
                      value={currentClient.adresse}
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

      {/* Utilisation du composant ClientDetail */}
      <ClientDetail 
        detailsClient={detailsClient}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        handleEdit={handleEdit}
      />

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
              <strong>Clients trouvés :</strong> {importData.length}
            </p>
            
            <div className="import-preview">
              <h3 className="preview-title">Aperçu des données</h3>
              <div className="import-table-container">
                <table className="articles-table">
                  <thead className="articles-table-head">
                    <tr>
                      <th className="articles-table-header">Nom</th>
                      <th className="articles-table-header">Identifiant</th>
                      <th className="articles-table-header">Téléphone</th>
                      <th className="articles-table-header">Email</th>
                      <th className="articles-table-header">Pays</th>
                    </tr>
                  </thead>
                  <tbody className="articles-table-body">
                    {importData.slice(0, 5).map((client, index) => (
                      <tr key={index} className="articles-table-row">
                        <td className="articles-table-cell">{client.nom}</td>
                        <td className="articles-table-cell">{client.identifiant}</td>
                        <td className="articles-table-cell">{client.tel}</td>
                        <td className="articles-table-cell">{client.email}</td>
                        <td className="articles-table-cell">{client.pays}</td>
                      </tr>
                    ))}
                    {importData.length > 5 && (
                      <tr className="articles-table-row">
                        <td colSpan="5" className="articles-table-cell text-center">
                          ... et {importData.length - 5} autres clients
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
              Importer {importData.length} client(s)
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

export default Clients;

