import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Users, Package, Receipt, Book, 
  ChevronRight, Calendar, 
  ChevronDown, ChevronUp, ArrowRight, FileText,
  DollarSign, CreditCard, AlertTriangle, BarChart2
} from 'lucide-react';
import TopClientsSuppliersChart from "../../components/TopClientsSuppliersChart";
import FactureStatusChart from '../../components/FactureStatusChart';
import RevenueExpenseTrend from '../../components/RevenueExpenseTrend';
import { useAccountId } from '../../hooks/useAccountId';
import "./Home.css"

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('invoices');
  const [clients, setClients] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [ecritures, setEcritures] = useState([]);
  const [factures, setFactures] = useState([]);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [outstandingInvoices, setOutstandingInvoices] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);


  const accountId = useAccountId();

  useEffect(() => {
    Promise.all([
      fetchClients(),
      fetchFournisseurs(),
      fetchEcritures(),
      fetchFactures()
    ]).then(() => {
      setLoading(false);
    }).catch(error => {
      console.error("Erreur lors du chargement des données:", error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (factures.length > 0) {
      const revenue = factures
        .filter(f => f.clientId)
        .reduce((sum, f) => sum + f.totalTTC, 0);
      
      const expenses = factures
        .filter(f => f.fournisseurId)
        .reduce((sum, f) => sum + f.totalTTC, 0);
      
      const unpaid = factures
        .filter(f => !f.paid)
        .reduce((sum, f) => sum + f.totalTTC, 0);
      
      const balance = revenue - expenses;
      
      setTotalRevenue(revenue);
      setTotalExpenses(expenses);
      setOutstandingInvoices(unpaid);
      setTotalBalance(balance);
    }
  }, [factures]);


  const fetchClients = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/clients/account/${accountId}`);
      if(response.data && response.data.data){
        setClients(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    }
  };
  
  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/fournisseurs/account/${accountId}`);
      if(response.data){
        setFournisseurs(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des fournisseurs:", error);
    }
  };

  const fetchEcritures = async () => {
    try {
      const response = await axios.get("http://localhost:8080/ecriture-comptable");
      if (response.data) {
        setEcritures(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des écritures:", err);
    }
  };

  const fetchFactures = async () => {
    try {
      const response = await axios.get("http://localhost:8080/factures");
      if (response.data) {
        setFactures(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des factures:", error);
    }
  };
  
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  const getEntityDetails = (facture) => {
    if (facture.clientId) {
      return { 
        ...clients.find(c => c.id === facture.clientId) || {},
        type: 'client'
      };
    } else if (facture.fournisseurId) {
      return { 
        ...fournisseurs.find(s => s.id === facture.fournisseurId) || {},
        type: 'fournisseur'
      };
    }
    return { type: 'inconnu' };
  };

  const getStatusColor = (paid) => {
    return paid ? 'home-status-paid' : 'home-status-pending';
  };

  if (loading) {
    return (
      <div className="home-loading-container">
        <div className="home-loading-content">
          <div className="home-loading-spinner"></div>
          <p className="home-loading-text">Chargement du tableau de bord comptable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-main-content">
        <div className="home-content">
          <header className="home-header">
            <h1 className="home-title">Tableau de bord comptable</h1>
            <div className="home-date">
              <Calendar size={16} className="home-date-icon" />
              <span>{new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}</span>
            </div>
          </header>

          <div className="home-metrics">
            <div className="home-metric-card home-metric-revenue">
              <div className="home-metric-content">
                <div className="home-metric-info">
                  <h3 className="home-metric-title">Revenus totaux</h3>
                  <p className="home-metric-value">{totalRevenue.toFixed(3)} TND</p>
                </div>
                <div className="home-metric-icon">
                  <DollarSign size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-metric-card home-metric-expenses">
              <div className="home-metric-content">
                <div className="home-metric-info">
                  <h3 className="home-metric-title">Dépenses totales</h3>
                  <p className="home-metric-value">{totalExpenses.toFixed(3)} TND</p>
                </div>
                <div className="home-metric-icon">
                  <CreditCard size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-metric-card home-metric-balance">
              <div className="home-metric-content">
                <div className="home-metric-info">
                  <h3 className="home-metric-title">Solde global</h3>
                  <p className="home-metric-value">{totalBalance.toFixed(3)} TND</p>
                </div>
                <div className="home-metric-icon">
                  <BarChart2 size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-metric-card home-metric-outstanding">
              <div className="home-metric-content">
                <div className="home-metric-info">
                  <h3 className="home-metric-title">Factures impayées</h3>
                  <p className="home-metric-value">{outstandingInvoices.toFixed(3)} TND</p>
                </div>
                <div className="home-metric-icon">
                  <AlertTriangle size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="home-stats">
            <div className="home-stat-card">
              <div className="home-stat-content">
                <div className="home-stat-info">
                  <p>Clients</p>
                  <h3>{clients.length}</h3>
                </div>
                <div className="home-stat-icon home-stat-icon-green">
                  <Users size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-stat-card">
              <div className="home-stat-content">
                <div className="home-stat-info">
                  <p>Fournisseurs</p>
                  <h3>{fournisseurs.length}</h3>
                </div>
                <div className="home-stat-icon home-stat-icon-blue">
                  <Package size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-stat-card">
              <div className="home-stat-content">
                <div className="home-stat-info">
                  <p>Factures</p>
                  <h3>{factures.length}</h3>
                </div>
                <div className="home-stat-icon home-stat-icon-purple">
                  <Receipt size={24} />
                </div>
              </div>
            </div>
            
            <div className="home-stat-card">
              <div className="home-stat-content">
                <div className="home-stat-info">
                  <p>Écritures</p>
                  <h3>{ecritures.length}</h3>
                </div>
                <div className="home-stat-icon home-stat-icon-orange">
                  <Book size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="home-charts">
            <div className="home-chart-box">
              <h2 className="home-chart-title">Statut des Factures</h2>
              <div className="home-chart-content">
                <FactureStatusChart factures={factures} />
              </div>
            </div>
            
            <div className="home-chart-box">
              <h2 className="home-chart-title">Top Clients et Fournisseurs</h2>
              <div className="home-chart-content">
                {accountId ? (
                  <TopClientsSuppliersChart accountId={accountId} />
                ) : (
                  <div className="home-empty-chart">
                    <p>Veuillez sélectionner un compte pour afficher les données</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="home-details">
            <div className="home-section">
              <div className="home-section-header" onClick={() => toggleSection('invoices')}>
                <h3 className="home-section-title">Factures récentes</h3>
                <div className="home-section-toggle">
                  {expandedSection === 'invoices' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              {expandedSection === 'invoices' && (
                <div className="home-section-content">
                  <div className="home-table-container">
                    <table className="home-table">
                      <thead>
                        <tr>
                          <th>N° Facture</th>
                          <th>Client/Fournisseur</th>
                          <th className="home-text-right">Montant TTC</th>
                          <th className="home-text-center">Statut</th>
                          <th className="home-text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {factures.slice(0, 5).map((facture) => {
                          const entity = getEntityDetails(facture);
                          return (
                            <tr key={facture.id}>
                              <td className="home-font-medium">{facture.reference}</td>
                              <td>
                                {entity.type === 'client' ? (
                                           <span>
                                <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>Client </span>
                                <span className="home-entity home-entity-client">{entity.nom}</span>
                              </span> 
                                  
                                ) : entity.type === 'fournisseur' ? (
             <span>
                                <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem' }}>Fournisseur </span>
                                <span className="home-entity home-entity-supplier">{entity.nom}</span>
                              </span> 
                                  
                                ) : 'Inconnu'}
                              </td>
                              <td className="home-text-right">{facture.totalTTC.toFixed(3)} TND</td>
                              <td className="home-text-center">
                                <span className={`home-status-badge ${getStatusColor(facture.paid)}`}>
                                  {facture.paid ? 'Payée' : 'En attente'}
                                </span>
                              </td>
                              <td className="home-text-center">
                                <button className="home-action-button">
                                  <FileText size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="home-view-all">
                    <Link to="/facture-lines" className="home-link">
                      Voir toutes les factures <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="home-section">
              <div className="home-section-header" onClick={() => toggleSection('entries')}>
                <h3 className="home-section-title">Écritures comptables récentes</h3>
                <div className="home-section-toggle">
                  {expandedSection === 'entries' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              {expandedSection === 'entries' && (
                <div className="home-section-content">
                  <div className="home-table-container">
                    <table className="home-table">
                      <thead>
                        <tr>
                          <th>N° Écriture</th>
                          <th>Date</th>
                          <th className="home-text-right">Débit</th>
                          <th className="home-text-right">Crédit</th>
                          <th className="home-text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ecritures.slice(0, 5).map((entry) => {
                          const totalDebit = entry.lignes.reduce((sum, ligne) => sum + ligne.debit, 0);
                          const totalCredit = entry.lignes.reduce((sum, ligne) => sum + ligne.credit, 0);
                          
                          return (
                            <tr key={entry.id}>
                              <td className="home-font-medium">{entry.num}</td>
                              <td>{new Date(entry.date || Date.now()).toLocaleDateString('fr-FR')}</td>
                              <td className="home-text-right home-debit">
                                {totalDebit > 0 ? `${totalDebit.toFixed(2)} TND` : '-'}
                              </td>
                              <td className="home-text-right home-credit">
                                {totalCredit > 0 ? `${totalCredit.toFixed(2)} TND` : '-'}
                              </td>
                              <td className="home-text-center">
                                <button className="home-action-button">
                                  <FileText size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="home-view-all">
                    <Link to="/ecritures-comptables" className="home-link">
                      Voir toutes les écritures <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;