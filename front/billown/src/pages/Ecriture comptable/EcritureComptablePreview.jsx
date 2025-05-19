import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { toast, ToastContainer } from 'react-toastify';
import EcritureComptablePDF from './EcritureComptablePDF';
import './EcritureComptable.css';

const EcritureComptablePreview = () => {
  const [ecriture, setEcriture] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchEcritureDetails();
  }, [id]);
  
  const fetchEcritureDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8080/ecriture-comptable/${id}`);
      if (response.data) {
        setEcriture(response.data);
      }
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des détails de l'écriture");
      navigate('/ecritures-comptables');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      switch (error.response.status) {
        case 404:
          toast.error("Écriture comptable non trouvée");
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
  
  const handleBackToList = () => {
    navigate('/ecritures-comptables');
  };
  
  const handleDownloadPDF = async () => {
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
  
  if (loading) {
    return (
      <div className="preview-container">
        <div className="loading-spinner">
          <div className="loading-spinner-inner"></div>
        </div>
      </div>
    );
  }
  
  if (!ecriture) {
    return (
      <div className="preview-container">
        <div className="preview-error">
          <h2>Écriture non trouvée</h2>
          <button onClick={handleBackToList} className="btn-back">
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="preview-container">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      <div className="preview-header">
        <h1>Aperçu PDF - Écriture {ecriture.num}</h1>
        <div className="preview-actions">
          <button onClick={handleBackToList} className="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Retour
          </button>
          <button onClick={handleDownloadPDF} className="btn-download">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Télécharger
          </button>
        </div>
      </div>
      
      <div className="pdf-viewer-container">
        <PDFViewer width="100%" height="600px" className="pdf-viewer">
          <EcritureComptablePDF ecriture={ecriture} />
        </PDFViewer>
      </div>
    </div>
  );
};

export default EcritureComptablePreview;