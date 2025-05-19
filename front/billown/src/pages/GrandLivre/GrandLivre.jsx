import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import dayjs from 'dayjs';
import Pagination from "../../components/pagination/pagination";
import "./GrandLivre.css";

const POST_PER_PAGE = 10;

const GrandLivre = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const currencyFormatter = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return '-';
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    }).format(numericValue);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/grand-livre');
      setData(response.data.map(item => ({
        ...item,
        clientName: item.clientName || '-',
        fournisseurName: item.fournisseurName || '-',
        articleName: item.articleName || '-'
      })));
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération du grand livre");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getTypeDisplay = (record) => {
    if (record.clientName !== '-') return { label: 'Client', className: 'grandlivre-status-badge client' };
    if (record.fournisseurName !== '-') return { label: 'Fournisseur', className: 'grandlivre-status-badge fournisseur' };
    return { label: 'Comptable', className: 'grandlivre-status-badge comptable' };
  };

  const getTiers = (record) => {
    if (record.clientName !== '-') return record.clientName;
    if (record.fournisseurName !== '-') return record.fournisseurName;
    return 'N/A';
  };

  const filteredData = data.filter(record => 
    record.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.compteNumero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.compteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTiers(record).toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.articleName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const pages = Math.ceil(filteredData.length / POST_PER_PAGE);
  const indexOfLastRecord = currentPage * POST_PER_PAGE;
  const indexOfFirstRecord = indexOfLastRecord - POST_PER_PAGE;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalCredit = filteredData.reduce((sum, r) => sum + parseFloat(r.credit || 0), 0);
  const totalDebit = filteredData.reduce((sum, r) => sum + parseFloat(r.debit || 0), 0);
  const totalDifference = totalCredit - totalDebit;

  return (
    <div className="grandlivre-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="grandlivre-content">
        <div className="grandlivre-main">
          <div className="grandlivre-header">
            <h1 className="grandlivre-title">Grand Livre Comptable</h1>
            <p>Rechercher par référence, compte, tiers ou article</p>
          </div>

          <div className="grandlivre-search-container">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="grandlivre-search-input"
            />
          </div>

          <div className="grandlivre-ecritures-section">
            <h3>Liste des Écritures</h3>
            {loading ? (
              <div className="grandlivre-loading-container">
                <div className="grandlivre-spinner"></div>
              </div>
            ) : error ? (
              <div className="grandlivre-empty-state">
                <p>Erreur lors du chargement des données: {error}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="grandlivre-empty-state">
                <p>
                  {searchQuery ? "Aucune écriture ne correspond à votre recherche" : "Aucune écriture trouvée"}
                </p>
              </div>
            ) : (
              <div className="grandlivre-table-container">
                <table className="grandlivre-table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>RÉFÉRENCE</th>
                      <th>TYPE</th>
                      <th>TIERS</th>
                      <th>ARTICLE</th>
                      <th>N° COMPTE</th>
                      <th>NOM COMPTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => {
                      const typeDisplay = getTypeDisplay(record);
                      return (
                        <tr key={record.id || index}>
                          <td>{formatDate(record.dateEcriture) || "Invalid Date"}</td>
                          <td>{record.reference}</td>
                          <td>
                            <span className={typeDisplay.className}>
                              {typeDisplay.label}
                            </span>
                          </td>
                          <td>{getTiers(record)}</td>
                          <td>{record.articleName !== '-' ? record.articleName : 'N/A'}</td>
                          <td>{record.compteNumero}</td>
                          <td>{record.compteName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {!loading && filteredData.length > 0 && (
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

export default GrandLivre;