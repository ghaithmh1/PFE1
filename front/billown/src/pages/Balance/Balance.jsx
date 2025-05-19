import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../components/pagination/pagination";
import "./Balance.css";

const POST_PER_PAGE = 10;

const Balance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClients, setShowClients] = useState(true);
  const [filters, setFilters] = useState({
    balanceType: 'all',
    minCredit: '',
    maxDebit: '',
    minBalance: '',
    maxBalance: ''
  });

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
      setData(response.data);
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
  }, [searchQuery, showClients, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const processBalanceData = (isClient = true) => {
    const filtered = data.filter(item => {
      const hasClient = item.clientName && item.clientName !== '-';
      const hasFournisseur = item.fournisseurName && item.fournisseurName !== '-';
      if (!hasClient && !hasFournisseur) return false;
      return isClient ? hasClient : hasFournisseur;
    });

    const aggregated = filtered.reduce((acc, item) => {
      const key = isClient ? item.clientName : item.fournisseurName;
      if (!key) return acc;

      const existing = acc.find(e => e.name === key);

      if (existing) {
        existing.credit += parseFloat(item.credit || 0);
        existing.debit += parseFloat(item.debit || 0);
        existing.balance = existing.credit - existing.debit;
      } else {
        acc.push({
          name: key,
          credit: parseFloat(item.credit || 0),
          debit: parseFloat(item.debit || 0),
          balance: parseFloat(item.credit || 0) - parseFloat(item.debit || 0)
        });
      }
      return acc;
    }, []);

    return aggregated.filter(item => {
      const credit = item.credit;
      const debit = item.debit;
      const balance = item.balance;

      if (filters.minCredit && credit < parseFloat(filters.minCredit)) return false;
      if (filters.maxDebit && debit > parseFloat(filters.maxDebit)) return false;
      if (filters.minBalance && balance < parseFloat(filters.minBalance)) return false;
      if (filters.maxBalance && balance > parseFloat(filters.maxBalance)) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query)) return false;
      }

      switch(filters.balanceType) {
        case 'positive': return balance >= 0;
        case 'negative': return balance < 0;
        default: return true;
      }
    }).sort((a, b) => a.name.localeCompare(b.name));
  };

  const filteredData = processBalanceData(showClients);
  
  // Pagination
  const pages = Math.ceil(filteredData.length / POST_PER_PAGE);
  const indexOfLastRecord = currentPage * POST_PER_PAGE;
  const indexOfFirstRecord = indexOfLastRecord - POST_PER_PAGE;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  // Totals
  const totals = filteredData.reduce((acc, item) => ({
    credit: acc.credit + item.credit,
    debit: acc.debit + item.debit,
    balance: acc.balance + item.balance
  }), { credit: 0, debit: 0, balance: 0 });

  return (
    <div className="ecriture-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="ecriture-content">
        <div className="ecriture-main">
          <div className="ecriture-header">
            <h1 className="ecriture-title">Balance {showClients ? 'Clients' : 'Fournisseurs'}</h1>
          </div>

          <div className="balance-controls">
            <div className="balance-toggle">
              <button 
                className={`balance-button ${showClients ? 'active' : ''}`} 
                onClick={() => setShowClients(true)}
              >
                Clients
              </button>
              <button 
                className={`balance-button ${!showClients ? 'active' : ''}`} 
                onClick={() => setShowClients(false)}
              >
                Fournisseurs
              </button>
            </div>

            <div className="balance-filters">
              <select 
                value={filters.balanceType}
                onChange={(e) => handleFilterChange('balanceType', e.target.value)}
                className="filter-selectt"
              >
                <option value="all">Tous les soldes</option>
                <option value="positive">Solde positif</option>
                <option value="negative">Solde négatif</option>
              </select>

              <input
                placeholder="Crédit minimum"
                className="filter-inputt"
                value={filters.minCredit}
                onChange={(e) => handleFilterChange('minCredit', e.target.value.replace(/[^0-9.]/g, ''))}
              />

              <input
                placeholder="Débit maximum"
                className="filter-inputt"
                value={filters.maxDebit}
                onChange={(e) => handleFilterChange('maxDebit', e.target.value.replace(/[^0-9.]/g, ''))}
              />

              <input
                placeholder="Solde minimum"
                className="filter-inputt"
                value={filters.minBalance}
                onChange={(e) => handleFilterChange('minBalance', e.target.value.replace(/[^0-9.-]/g, ''))}
              />

              <input
                placeholder="Solde maximum"
                className="filter-inputt"
                value={filters.maxBalance}
                onChange={(e) => handleFilterChange('maxBalance', e.target.value.replace(/[^0-9.-]/g, ''))}
              />
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder={`Rechercher par nom de ${showClients ? 'client' : 'fournisseur'}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="ecritures-section">
            <h3>Liste des {showClients ? 'Clients' : 'Fournisseurs'}</h3>
            
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="empty-state">
                <p>Erreur lors du chargement des données: {error}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchQuery || Object.values(filters).some(v => v !== '' && v !== 'all') 
                    ? `Aucun ${showClients ? 'client' : 'fournisseur'} ne correspond à vos critères` 
                    : `Aucun ${showClients ? 'client' : 'fournisseur'} trouvé`}
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="ecritures-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%', textAlign: 'left' }}>{showClients ? 'Client' : 'Fournisseur'}</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Crédit Total</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Débit Total</th>
                      <th style={{ width: '20%', textAlign: 'right' }}>Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRecords.map((record, index) => (
                      <tr key={record.name || index}>
                        <td data-label={showClients ? 'Client' : 'Fournisseur'} style={{ textAlign: 'left' }}>{record.name}</td>
                        <td data-label="Crédit Total" className="credit-amount" style={{ textAlign: 'right' }}>
                          {record.credit > 0 ? `${currencyFormatter(record.credit)} TND` : '-'}
                        </td>
                        <td data-label="Débit Total" className="debit-amount" style={{ textAlign: 'right' }}>
                          {record.debit > 0 ? `${currencyFormatter(record.debit)} TND` : '-'}
                        </td>
                        <td 
                          data-label="Solde" 
                          className={record.balance >= 0 ? "credit-amount" : "debit-amount"}
                          style={{ fontWeight: 'bold', textAlign: 'right' }}
                        >
                          {currencyFormatter(Math.abs(record.balance))} TND
                          {record.balance !== 0 && (record.balance > 0 ? ' (Crédit)' : ' (Débit)')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Totaux:</td>
                      <td className="credit-amount" style={{ fontWeight: 'bold', textAlign: 'right' }}>
                        {currencyFormatter(totals.credit)} TND
                      </td>
                      <td className="debit-amount" style={{ fontWeight: 'bold', textAlign: 'right' }}>
                        {currencyFormatter(totals.debit)} TND
                      </td>
                      <td 
                        className={totals.balance >= 0 ? "credit-amount" : "debit-amount"}
                        style={{ fontWeight: 'bold', textAlign: 'right' }}
                      >
                        {currencyFormatter(Math.abs(totals.balance))} TND
                        {totals.balance !== 0 && (totals.balance > 0 ? ' (Crédit)' : ' (Débit)')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            {/* Composant de pagination */}
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

export default Balance;