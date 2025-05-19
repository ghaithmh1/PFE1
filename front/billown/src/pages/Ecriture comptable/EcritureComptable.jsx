import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./EcritureComptable.css";
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import EcritureComptablePDF from './EcritureComptablePDF';
import Pagination from "../../components/pagination/pagination";

const POST_PER_PAGE = 5;

const EcrituresComptablesList = () => {
  const [ecritures, setEcritures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const dropdownRefs = useRef({});

  useEffect(() => {
    fetchEcritures();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]); // Mise à jour pour scroller vers le haut lors du changement de page

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !dropdownRefs.current[activeDropdown]?.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Fermer le dropdown et le backdrop
  const closeDropdown = () => {
    setActiveDropdown(null);
    setShowBackdrop(false);
  };

  const fetchEcritures = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/ecriture-comptable");
      if (response.data) {
        setEcritures(response.data);
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des écritures comptables");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
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
      toast.error("Impossible de se connecter au serveur");
    } else {
      toast.error("Erreur de configuration de la requête");
    }
  };

  const toggleDropdown = (id) => {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      setShowBackdrop(activeDropdown !== id);
    }
    
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  // Handlers modifiés pour fermer le dropdown après l'action
  const handleDelete = async (id) => {
    closeDropdown();
    try {
      await axios.delete(`http://localhost:8080/ecriture-comptable/${id}`);
      toast.success("Écriture comptable supprimée avec succès");
      fetchEcritures();
    } catch (err) {
      handleApiError(err, "Erreur lors de la suppression de l'écriture comptable");
    } 
  };

  const handleEdit = (id) => {
    closeDropdown();
    navigate(`/ecritures-comptables/edit/${id}`);
  };

  const handlePreview = (id) => {
    closeDropdown();
    navigate(`/ecritures-comptables/preview/${id}`);
  };

  const handleDownload = async (id) => {
    closeDropdown();
    setLoading(true);
    try {
      // Récupérer les détails complets de l'écriture comptable
      const response = await axios.get(`http://localhost:8080/ecriture-comptable/${id}`);
      
      if (!response.data) {
        toast.error("Impossible de récupérer les détails de l'écriture comptable");
        return;
      }
      
      const ecritureDetails = response.data;
      
      // Vérifier que ecritureDetails contient toutes les informations nécessaires
      if (!ecritureDetails.lignes) {
        ecritureDetails.lignes = [];
      }
      
      // Générer le nom du fichier
      const fileName = `ecriture-${ecritureDetails.num || id}-${new Date().getTime()}.pdf`;
      
      try {
        // Générer le blob du PDF avec un handler d'erreur
        const blob = await pdf(
          <EcritureComptablePDF ecriture={ecritureDetails} />
        ).toBlob();
        
        // Créer un URL pour le blob
        const url = URL.createObjectURL(blob);
        
        // Créer un élément <a> pour déclencher le téléchargement
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success("PDF généré avec succès");
      } catch (pdfError) {
        console.error("Erreur lors de la génération du PDF:", pdfError);
        toast.error("Erreur lors de la génération du PDF. Vérifiez les données de l'écriture.");
      }
    } catch (err) {
      handleApiError(err, "Erreur lors du téléchargement de l'écriture comptable");
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddEcriture = () => {
    navigate("/ecritures-comptables/add");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(Math.abs(montant || 0));
  };

  const filteredEcritures = ecritures.filter(ecriture => 
    ecriture.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ecriture.statut?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ecriture.num && ecriture.num.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination
  const pages = Math.ceil(filteredEcritures.length / POST_PER_PAGE);
  const indexOfLastEcriture = currentPage * POST_PER_PAGE;
  const indexOfFirstEcriture = indexOfLastEcriture - POST_PER_PAGE;
  const currentEcritures = filteredEcritures.slice(indexOfFirstEcriture, indexOfLastEcriture);

  // Réinitialiser la page courante lorsque la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="ecriture-container">
      <ToastContainer position="top-right" autoClose={3000} />
      {showBackdrop && <div className="dropdown-backdrop" onClick={closeDropdown}></div>}
      <div className="ecriture-content">
        <div className="ecriture-main">
          <div className="ecriture-header">
            <h1 className="ecriture-title">Gestion des Écritures Comptables</h1>
            <button
              onClick={handleAddEcriture}
              className="btn-add"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter une Écriture
            </button>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Rechercher par N°, référence ou statut"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="ecritures-section">
            <h3>Liste des Écritures Comptables</h3>
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : filteredEcritures.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchQuery ? "Aucune écriture comptable ne correspond à votre recherche" : "Aucune écriture comptable trouvée"}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={handleAddEcriture}
                  >
                    Ajouter votre première écriture comptable
                  </button>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="ecritures-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Référence</th>
                      <th>Statut</th>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEcritures.map((ecriture) => (
                      <tr key={ecriture.id}>
                        <td data-label="N°">{ecriture.num}</td>
                        <td data-label="Référence">{ecriture.reference}</td>
                        <td data-label="Statut">
                          <span className={`status-badge ${ecriture.statut === "Brouillon" ? "draft" : "validated"}`}>
                            {ecriture.statut}
                          </span>
                        </td>
                        <td data-label="Date">{formatDate(ecriture.date)}</td>
                        <td data-label="Montant">
                          {formatMontant(ecriture.montantAbsolu)} TND                        
                        </td>
                        <td data-label="Action">
                          <div className="dropdown" ref={el => dropdownRefs.current[ecriture.id] = el}>
                            <button 
                              onClick={() => toggleDropdown(ecriture.id)}
                              className="btn-action"
                              aria-expanded={activeDropdown === ecriture.id}
                            >
                              Action
                              <svg 
                                className={`ml-2 h-4 w-4 transform ${activeDropdown === ecriture.id ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            {activeDropdown === ecriture.id && (
                              <div className="dropdown-menu">
                                <div className="dropdown-menu-inner">
                                  <button
                                    onClick={() => handlePreview(ecriture.id)}
                                    className="dropdown-item"
                                  >
                                    Prévisualiser
                                  </button>
                                  <button
                                    onClick={() => handleEdit(ecriture.id)}
                                    className="dropdown-item"
                                  >
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDownload(ecriture.id)}
                                    className="dropdown-item"
                                  >
                                    Télécharger
                                  </button>
                                  <button
                                    onClick={() => handleDelete(ecriture.id)}
                                    className="dropdown-item danger"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Composant de pagination */}
            {!loading && filteredEcritures.length > 0 && (
              <Pagination
                pages={pages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcrituresComptablesList;