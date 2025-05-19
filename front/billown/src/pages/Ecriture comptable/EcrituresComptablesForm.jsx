import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import "./EcritureComptable.css";

const EcrituresComptablesForm = () => {
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [comptes, setComptes] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentEcriture, setCurrentEcriture] = useState({
    id: null,
    reference: "",
    statut: "",
    date: new Date().toISOString().split("T")[0],
    lignesDebit: [
      {
        id: null,
        description: "",
        montant: 0.0,
        compte: null,
        type: "DEBIT"
      }
    ],
    lignesCredit: [
      {
        id: null,
        description: "",
        montant: 0.0,
        compte: null,
        type: "CREDIT"
      }
    ]
  });
  
  const navigate = useNavigate();
  const { id } = useParams(); // Pour récupérer l'ID de l'écriture à éditer depuis l'URL
  
  // Récupérer les comptes et l'écriture (si en mode édition) au chargement du composant
  useEffect(() => {
    fetchComptes();
    
    // Si un ID est fourni dans l'URL, charger l'écriture correspondante
    if (id) {
      setEditMode(true);
      fetchEcriture(id);
    }
  }, [id]);

  useEffect( () => {
        window.scrollTo(0, 0);
    }, []);

  // Récupérer l'écriture à éditer
  const fetchEcriture = async (ecritureId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/ecriture-comptable/${ecritureId}`);
      if (response.data) {
        // Formatage de la date pour l'input date
        const ecriture = response.data;
        if (ecriture.date) {
          const dateObj = new Date(ecriture.date);
          ecriture.date = dateObj.toISOString().split('T')[0];
        }
        
        // Séparer les lignes en débit et crédit
        const lignesDebit = ecriture.lignes.filter(ligne => ligne.debit > 0).map(ligne => ({
          id: ligne.id,
          description: ligne.description,
          montant: ligne.debit,
          compte: ligne.compte,
          type: "DEBIT"
        }));
        
        const lignesCredit = ecriture.lignes.filter(ligne => ligne.credit > 0).map(ligne => ({
          id: ligne.id,
          description: ligne.description,
          montant: ligne.credit,
          compte: ligne.compte,
          type: "CREDIT"
        }));
        
        setCurrentEcriture({
          ...ecriture,
          lignesDebit: lignesDebit.length > 0 ? lignesDebit : [{
            id: null,
            description: "",
            montant: 0.0,
            compte: null,
            type: "DEBIT"
          }],
          lignesCredit: lignesCredit.length > 0 ? lignesCredit : [{
            id: null,
            description: "",
            montant: 0.0,
            compte: null,
            type: "CREDIT"
          }]
        });
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération de l'écriture comptable");
      // Retour à la liste en cas d'erreur
      navigate("/ecritures-comptables");
    } finally {
      setLoading(false);
    }
  };
  
  // Récupérer tous les comptes pour les sélecteurs
  const fetchComptes = async () => {
    try {
      const response = await axios.get("http://localhost:8080/compte");
      if (response.data) {
        setComptes(response.data);
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des comptes");
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

  // Validation du formulaire
  const validateForm = () => {
    // Validation de la référence
    if (!currentEcriture.reference.trim()) {
      toast.error("La référence ne peut pas être vide");
      return false;
    }
    
    // Validation du statut
    if (!currentEcriture.statut.trim()) {
      toast.error("Le statut ne peut pas être vide");
      return false;
    }
    
    // Validation de la date
    if (!currentEcriture.date) {
      toast.error("La date ne peut pas être vide");
      return false;
    }
    
    // Validation des lignes d'écriture
    if (currentEcriture.lignesDebit.length === 0 && currentEcriture.lignesCredit.length === 0) {
      toast.error("L'écriture doit contenir au moins une ligne");
      return false;
    }
    
    // Vérifier que chaque ligne de débit a un compte et un montant
    for (let i = 0; i < currentEcriture.lignesDebit.length; i++) {
      const ligne = currentEcriture.lignesDebit[i];
      
      if (!ligne.description || ligne.description.trim() === "") {
        toast.error(`La description de la ligne débit ${i + 1} ne peut pas être vide`);
        return false;
      }
      
      if (!ligne.compte) {
        toast.error(`Le compte de la ligne débit ${i + 1} doit être sélectionné`);
        return false;
      }
      
      if (ligne.montant <= 0) {
        toast.error(`La ligne débit ${i + 1} doit avoir un montant supérieur à 0`);
        return false;
      }
    }
    
    // Vérifier que chaque ligne de crédit a un compte et un montant
    for (let i = 0; i < currentEcriture.lignesCredit.length; i++) {
      const ligne = currentEcriture.lignesCredit[i];
      
      if (!ligne.description || ligne.description.trim() === "") {
        toast.error(`La description de la ligne crédit ${i + 1} ne peut pas être vide`);
        return false;
      }
      
      if (!ligne.compte) {
        toast.error(`Le compte de la ligne crédit ${i + 1} doit être sélectionné`);
        return false;
      }
      
      if (ligne.montant <= 0) {
        toast.error(`La ligne crédit ${i + 1} doit avoir un montant supérieur à 0`);
        return false;
      }
    }
    
    // Vérifier que l'écriture est équilibrée
    const totalDebit = currentEcriture.lignesDebit.reduce((sum, ligne) => sum + parseFloat(ligne.montant || 0), 0);
    const totalCredit = currentEcriture.lignesCredit.reduce((sum, ligne) => sum + parseFloat(ligne.montant || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      toast.error("L'écriture n'est pas équilibrée. Total débit: " + totalDebit + ", Total crédit: " + totalCredit);
      return false;
    }
    
    return true;
  };

  // Gérer les changements dans le formulaire principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEcriture({
      ...currentEcriture,
      [name]: value
    });
  };
  
  // Gérer les changements dans les lignes de débit
  const handleLigneDebitChange = (index, e) => {
    const { name, value } = e.target;
    const newLignesDebit = [...currentEcriture.lignesDebit];
    
    if (name === "compte") {
      // Traitement spécial pour la sélection de compte
      const selectedCompte = comptes.find(c => c.id === parseInt(value));
      newLignesDebit[index].compte = selectedCompte;
    } else {
      newLignesDebit[index][name] = name === "montant" ? parseFloat(value) || 0 : value;
    }
    
    setCurrentEcriture({
      ...currentEcriture,
      lignesDebit: newLignesDebit
    });
  };
  
  // Gérer les changements dans les lignes de crédit
  const handleLigneCreditChange = (index, e) => {
    const { name, value } = e.target;
    const newLignesCredit = [...currentEcriture.lignesCredit];
    
    if (name === "compte") {
      // Traitement spécial pour la sélection de compte
      const selectedCompte = comptes.find(c => c.id === parseInt(value));
      newLignesCredit[index].compte = selectedCompte;
    } else {
      newLignesCredit[index][name] = name === "montant" ? parseFloat(value) || 0 : value;
    }
    
    setCurrentEcriture({
      ...currentEcriture,
      lignesCredit: newLignesCredit
    });
  };
  
  // Ajouter une nouvelle ligne de débit
  const handleAddLigneDebit = () => {
    setCurrentEcriture({
      ...currentEcriture,
      lignesDebit: [
        ...currentEcriture.lignesDebit,
        {
          id: null,
          description: "",
          montant: 0.0,
          compte: null,
          type: "DEBIT"
        }
      ]
    });
  };
  
  // Ajouter une nouvelle ligne de crédit
  const handleAddLigneCredit = () => {
    setCurrentEcriture({
      ...currentEcriture,
      lignesCredit: [
        ...currentEcriture.lignesCredit,
        {
          id: null,
          description: "",
          montant: 0.0,
          compte: null,
          type: "CREDIT"
        }
      ]
    });
  };
  
  // Supprimer une ligne de débit
  const handleRemoveLigneDebit = (index) => {
    if (currentEcriture.lignesDebit.length > 1) {
      const newLignesDebit = currentEcriture.lignesDebit.filter((_, i) => i !== index);
      setCurrentEcriture({
        ...currentEcriture,
        lignesDebit: newLignesDebit
      });
    } else {
      toast.warn("Vous devez conserver au moins une ligne de débit");
    }
  };
  
  // Supprimer une ligne de crédit
  const handleRemoveLigneCredit = (index) => {
    if (currentEcriture.lignesCredit.length > 1) {
      const newLignesCredit = currentEcriture.lignesCredit.filter((_, i) => i !== index);
      setCurrentEcriture({
        ...currentEcriture,
        lignesCredit: newLignesCredit
      });
    } else {
      toast.warn("Vous devez conserver au moins une ligne de crédit");
    }
  };

  // Gérer l'ouverture du dropdown de statut
  const handleOpenStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  // Sélectionner un statut
  const handleSelectStatus = (status) => {
    setCurrentEcriture({
      ...currentEcriture,
      statut: status
    });
    setShowStatusDropdown(false);
  };

  
const prepareEcritureForSubmit = () => {
  // Créer une copie de l'objet pour éviter de modifier l'état directement
  const preparedEcriture = { ...currentEcriture };
  
  // Convertir les lignes de débit et crédit au format attendu par le serveur
  // Sans inclure les IDs des lignes, même en mode édition
  const lignes = [
    ...preparedEcriture.lignesDebit.map(ligne => ({
      // Ne pas inclure l'ID des lignes pour éviter les conflits
      description: ligne.description,
      debit: ligne.montant,
      credit: 0,
      compte: { id: ligne.compte?.id }
    })),
    ...preparedEcriture.lignesCredit.map(ligne => ({
      // Ne pas inclure l'ID des lignes pour éviter les conflits
      description: ligne.description,
      debit: 0,
      credit: ligne.montant,
      compte: { id: ligne.compte?.id }
    }))
  ];
  
  return {
    id: preparedEcriture.id,
    reference: preparedEcriture.reference,
    statut: preparedEcriture.statut,
    date: preparedEcriture.date,
    lignes: lignes
  };
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Valider le formulaire avant soumission
  if (!validateForm()) return;
  
  const preparedEcriture = prepareEcritureForSubmit();
  console.log("Données envoyées au serveur:", JSON.stringify(preparedEcriture, null, 2));
  
  try {
    if (editMode) {
      // Utiliser directement axios.put avec les données préparées
      const response = await axios.put(
        `http://localhost:8080/ecriture-comptable/${currentEcriture.id}`,
        preparedEcriture,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data) {
        toast.success("Écriture comptable mise à jour avec succès");
      }
    } else {
      // Créer une nouvelle écriture
      const response = await axios.post(
        "http://localhost:8080/ecriture-comptable",
        preparedEcriture,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data) {
        toast.success("Écriture comptable ajoutée avec succès");
      }
    }
    // Rediriger vers la liste des écritures
    navigate("/ecritures-comptables");
  } catch (err) {
    // Gestion des erreurs...
    console.log("Erreur complète:", err);
    if (err.response) {
      console.log("Données d'erreur:", err.response.data);
      console.log("Statut d'erreur:", err.response.status);
      console.log("En-têtes d'erreur:", err.response.headers);
    }
    handleApiError(err, "Erreur lors de l'enregistrement de l'écriture comptable");
  }
};

  // Annuler et retourner à la liste
  const handleCancel = () => {
    navigate("/ecritures-comptables");
  };
  
  // Fonction de navigation pour le Sidebar
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Calculer les totaux
  const calculateTotals = () => {
    const totalDebit = currentEcriture.lignesDebit.reduce((sum, ligne) => sum + parseFloat(ligne.montant || 0), 0);
    const totalCredit = currentEcriture.lignesCredit.reduce((sum, ligne) => sum + parseFloat(ligne.montant || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    
    return { totalDebit, totalCredit, difference, isBalanced: difference < 0.001 };
  };
  
  const { totalDebit, totalCredit, difference, isBalanced } = calculateTotals();

  return (
    <div className="form-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored"/>
      <div className="form-content">
        {/* Contenu principal */}
        <div className="form-main">
          <div className="form-header">
            <h1 className="form-title">
              {editMode ? "Modifier une Écriture Comptable" : "Ajouter une Écriture Comptable"}
            </h1>
            <button
              onClick={handleCancel}
              className="btn-back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Retour à la liste
            </button>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="loading-spinner-inner"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form-space" noValidate>
              {/* Informations de base */}
              <div className="form-section">
                <h2 className="form-section-title">Informations de base</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Référence
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={currentEcriture.reference}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={currentEcriture.date}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Statut
                    </label>
                    <div className="status-dropdown">
                      <input
                        type="text"
                        name="statut"
                        value={currentEcriture.statut}
                        readOnly
                        onClick={handleOpenStatusDropdown}
                        className="form-input"
                        placeholder="Sélectionner un statut"
                      />
                      {showStatusDropdown && (
                        <div className="status-dropdown-menu">
                          <button 
                            type="button"
                            onClick={() => handleSelectStatus("Brouillon")}
                            className="status-dropdown-item"
                          >
                            Brouillon
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleSelectStatus("Publier")}
                            className="status-dropdown-item"
                          >
                            Publier
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Débit */}
              <div className="form-section">
                <div className="form-header">
                  <h2 className="form-section-title">Lignes au débit</h2>
                  <button
                    type="button"
                    onClick={handleAddLigneDebit}
                    className="btn-add"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter un débit
                  </button>
                </div>
                
                {/* Entêtes du tableau débit */}
                <div className="table-header">
                  <div>Compte</div>
                  <div>Description</div>
                  <div>Débit</div>
                  <div>Action</div>
                </div>
                
                {currentEcriture.lignesDebit.map((ligne, index) => (
                  <div key={`debit-${index}`} className="table-row">
                    <div>
                      <select
                        name="compte"
                        value={ligne.compte?.id || ""}
                        onChange={(e) => handleLigneDebitChange(index, e)}
                        className="form-select"
                        required
                      >
                        <option value="">Sélectionnez un compte</option>
                        {comptes.map(compte => (
                          <option key={`debit-compte-${compte.id}`} value={compte.id}>
                            {compte.numero} - {compte.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="description"
                        value={ligne.description}
                        onChange={(e) => handleLigneDebitChange(index, e)}
                        className="form-input"
                        placeholder="Description"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="montant"
                        value={ligne.montant}
                        onChange={(e) => handleLigneDebitChange(index, e)}
                        className="form-input amount-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLigneDebit(index)}
                        className="btn-remove-line"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                
              </div>
              
              {/* Section Crédit - Structure similaire à la section Débit */}
              <div className="form-section">
                <div className="form-header">
                  <h2 className="form-section-title">Lignes au crédit</h2>
                  <button
                    type="button"
                    onClick={handleAddLigneCredit}
                    className="btn-add"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter un crédit
                  </button>
                </div>
                
{/* Entêtes du tableau débit */}
<div className="table-header">
                  <div>Compte</div>
                  <div>Description</div>
                  <div>Crédit</div>
                  <div>Action</div>
                </div>
                
                {currentEcriture.lignesCredit.map((ligne, index) => (
                  <div key={`credit-${index}`} className="table-row">
                    <div>
                      <select
                        name="compte"
                        value={ligne.compte?.id || ""}
                        onChange={(e) => handleLigneCreditChange(index, e)}
                        className="form-select"
                        required
                      >
                        <option value="">Sélectionnez un compte</option>
                        {comptes.map(compte => (
                          <option key={`credit-compte-${compte.id}`} value={compte.id}>
                            {compte.numero} - {compte.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        name="description"
                        value={ligne.description}
                        onChange={(e) => handleLigneCreditChange(index, e)}
                        className="form-input"
                        placeholder="Description"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="montant"
                        value={ligne.montant}
                        onChange={(e) => handleLigneCreditChange(index, e)}
                        className="form-input amount-input"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="center">
                      <button
                        type="button"
                        onClick={() => handleRemoveLigneCredit(index)}
                        className="btn-remove-line"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>              
                      </div>
                      </div>
                    ))}
                    <div className="form-actions">
                  
                </div>
                </div>



              {/* Résumé et totaux */}
              <div className="form-section">
                <h2 className="form-section-title">Résumé de l'écriture</h2>
                <div className="summary-grid">
                  <div className="summary-card summary-debit">
                    <h3 className="summary-title">Total Débit</h3>
                    <p className="summary-value">{totalDebit.toFixed(2)} €</p>
                  </div>
                  <div className="summary-card summary-credit">
                    <h3 className="summary-title">Total Crédit</h3>
                    <p className="summary-value">{totalCredit.toFixed(2)} €</p>
                  </div>
                  <div className={`summary-card summary-difference ${isBalanced ? 'balanced' : 'unbalanced'}`}>
                    <h3 className="summary-title">Différence</h3>
                    <p className={`summary-value ${isBalanced ? 'balanced' : 'unbalanced'}`}>
                      {difference.toFixed(2)} €
                    </p>
                    {isBalanced ? (
                      <p className="summary-status balanced">L'écriture est équilibrée</p>
                    ) : (
                      <p className="summary-status unbalanced">L'écriture n'est pas équilibrée</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons de soumission */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-cancel"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={!isBalanced}
                >
                  {editMode ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </form>
          )}
              </div>
              </div>
              </div>
              );
              };

export default EcrituresComptablesForm;