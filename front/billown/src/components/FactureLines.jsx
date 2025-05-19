import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Pagination from '../components/pagination/pagination';
import { useAccountId } from '../hooks/useAccountId';
import FactureDetail from './FactureDetail';

const FACTURES_PER_PAGE = 5;
const API_URL = 'http://localhost:8080';

const FactureLines = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filters, setFilters] = useState({
    entity: '',
    article: '',
    amount: '',
    date: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const accountId = useAccountId();

  const formatDate = (dateString) => {
  if (!dateString) return 'Non spécifiée';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'Date invalide' 
      : date.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
  } catch (e) {
    return 'Format invalide';
  }
};

  useEffect(() => {
    fetchData();
  }, [accountId]);

  const handleApiError = (error, message = "An error occurred") => {
    console.error(message, error);
    setError(message);
  };

  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [facturesRes, clientsRes, suppliersRes, articlesRes] = await Promise.all([
        axios.get(`${API_URL}/factures`),
        axios.get(`${API_URL}/clients/account/${accountId}`),
        axios.get(`${API_URL}/fournisseurs/account/${accountId}`),
        axios.get(`${API_URL}/articles/account/${accountId}`)
      ]);

      setFactures(Array.isArray(facturesRes.data) ? facturesRes.data : []);
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : 
                (clientsRes.data && Array.isArray(clientsRes.data.data) ? clientsRes.data.data : []));
      setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : 
                  (suppliersRes.data && Array.isArray(suppliersRes.data.data) ? suppliersRes.data.data : []));
      setArticles(Array.isArray(articlesRes.data) ? articlesRes.data : 
                 (articlesRes.data && Array.isArray(articlesRes.data.data) ? articlesRes.data.data : []));
      
      setError(null);
    } catch (error) {
      handleApiError(error, "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (facture) => {
    setSelectedFacture(facture);
    setShowDetailsModal(true);
  };

  const getEntityDetails = (facture) => {
    if (facture.clientId) {
      return clients.find(c => c.id === facture.clientId) || {};
    } else if (facture.fournisseurId) {
      return suppliers.find(s => s.id === facture.fournisseurId) || {};
    }
    return {};
  };

  const generateInvoicePDF = (facture) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const entity = getEntityDetails(facture);
      const entityType = facture.clientId ? 'Client' : 'Supplier';

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FACTURE', pageWidth / 2, 20, { align: 'center' });

      // Invoice Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Référence: ${facture.reference}`, 14, 28);
      doc.text(`Date: ${formatDate(facture.dateEmission)}`, pageWidth - 60, 28);
      doc.text(`${entityType}: ${entity.nom || ''}`, 14, 36);

      // Items Table
      autoTable(doc, {
        startY: 45,
        head: [['Article', 'Taxe', 'P.U. HT', 'Quantité', 'Montant HT', 'Montant TTC']],
        body: facture.lignes.map(item => {
          const article = articles.find(a => a.id === item.articleId) || {};
          const htAmount = item.prixUnitaire * item.quantite;
          const ttcAmount = htAmount * (1 + (item.tvaRate / 100));
          return [
            article.designation || 'N/A',
            `${item.tvaRate}%`,
            `${item.prixUnitaire.toFixed(3)}`,
            item.quantite,
            `${htAmount.toFixed(3)}`,
            `${ttcAmount.toFixed(3)}`
          ];
        }),
        styles: { 
          fontSize: 10,
          cellPadding: 3,
          halign: 'center'
        },
        headStyles: {
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        theme: 'grid'
      });

      // Totals
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Total HT: ${facture.totalHT.toFixed(3)} TND`, pageWidth - 65, finalY);
      doc.text(`Total TVA: ${(facture.totalTTC - facture.totalHT).toFixed(3)} TND`, pageWidth - 65, finalY + 8);
      doc.text(`Total TTC: ${facture.totalTTC.toFixed(3)} TND`, pageWidth - 65, finalY + 16);

      doc.save(`${facture.reference}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Échec de la génération du PDF');
    }
  };

  const exportToCSV = (facture) => {
    try {
      const entity = getEntityDetails(facture);
      const entityType = facture.clientId ? 'Client' : 'Fournisseur';
      
      const headers = [
        'Référence', 'Date', entityType,
        'Article', 'Taxe', 'P.U. HT', 'Quantité', 'Montant HT', 'Montant TTC',
        'Total HT', 'Total TVA', 'Total TTC', 'Payé', 'Solde'
      ];

      const articlesData = facture.lignes.map(item => {
        const article = articles.find(a => a.id === item.articleId) || {};
        const htAmount = item.prixUnitaire * item.quantite;
        const ttcAmount = htAmount * (1 + (item.tvaRate / 100));
        return [
          facture.reference,
          formatDate(facture.dateEmission),
          entity.nom || '',
          article.designation || 'N/A',
          `${item.tvaRate}%`,
          item.prixUnitaire.toFixed(3),
          item.quantite,
          htAmount.toFixed(3),
          ttcAmount.toFixed(3)
        ];
      });

      const totalsRow = [
        '', '', '', '', '', '', '', '', '',
        facture.totalHT.toFixed(3),
        (facture.totalTTC - facture.totalHT).toFixed(3),
        facture.totalTTC.toFixed(3),
        facture.paidAmount?.toFixed(3) || '0.000',
        (facture.totalTTC - (facture.paidAmount || 0)).toFixed(3)
      ];

      const csvContent = [
        headers.join(';'),
        ...articlesData.map(row => row.join(';')),
        totalsRow.join(';')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `${facture.reference}.csv`);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Échec de l\'export CSV');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        const response = await axios.delete(`${API_URL}/factures/${id}`);
        
        if (response.status !== 200) throw new Error('Échec de la suppression');
        
        setFactures(prev => prev.filter(facture => facture.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Échec de la suppression de la facture');
      }
    }
  };

  const filteredFactures = factures.filter(facture => {
    const matchesType = 
      filterType === 'all' ||
      (filterType === 'client' && facture.clientId !== null) ||
      (filterType === 'supplier' && facture.fournisseurId !== null);

    const matchesEntity = filters.entity 
      ? (facture.clientId?.toString() === filters.entity || 
         facture.fournisseurId?.toString() === filters.entity)
      : true;
    
    const matchesAmount = filters.amount 
      ? parseFloat(facture.totalTTC) >= parseFloat(filters.amount)
      : true;
    
    const matchesArticle = filters.article 
      ? facture.lignes?.some(ligne => ligne.articleId.toString() === filters.article)
      : true;
    
    const matchesDate = filters.date 
  ? facture.dateEmission && new Date(facture.dateEmission).toString() !== 'Invalid Date'
    ? new Date(facture.dateEmission).toISOString().split('T')[0] === filters.date
    : false
  : true;

    return matchesType && matchesEntity && matchesArticle && matchesAmount && matchesDate;
  });

  // Pagination
  const pages = Math.ceil(filteredFactures.length / FACTURES_PER_PAGE);
  const indexOfLastFacture = currentPage * FACTURES_PER_PAGE;
  const indexOfFirstFacture = indexOfLastFacture - FACTURES_PER_PAGE;
  const currentFactures = filteredFactures.slice(indexOfFirstFacture, indexOfLastFacture);

  const clearFilters = () => {
    setFilterType('all');
    setFilters({
      entity: '',
      article: '',
      amount: '',
      date: ''
    });
    setCurrentPage(1);
  };

  if (loading) return (
    <div className="p-6 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 text-red-600">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong>Erreur :</strong> {error}
      </div>
      <button
        onClick={() => fetchData()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de facture</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">Tous types</option>
              <option value="client">Factures clients</option>
              <option value="supplier">Factures fournisseurs</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filterType === 'supplier' ? 'Fournisseur' : 'Client'}
            </label>
            <select
              value={filters.entity}
              onChange={(e) => {
                setFilters({...filters, entity: e.target.value});
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
              disabled={filterType === 'all'}
            >
              <option value="">Tous {filterType === 'supplier' ? 'fournisseurs' : 'clients'}</option>
              {(filterType === 'supplier' ? suppliers : clients).map(item => (
                <option key={item.id} value={item.id}>{item.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
            <select
              value={filters.article}
              onChange={(e) => {
                setFilters({...filters, article: e.target.value});
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Tous les articles</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>{article.designation}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant minimum</label>
            <input
              type="number"
              placeholder="Montant"
              value={filters.amount}
              onChange={(e) => {
                setFilters({...filters, amount: e.target.value});
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => {
                setFilters({...filters, date: e.target.value});
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 w-full"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {filteredFactures.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {filterType !== 'all' || Object.values(filters).some(Boolean)
              ? "Aucune facture ne correspond à vos critères"
              : "Aucune facture trouvée"}
          </div>
        ) : (
          <div className="border rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {filterType === 'supplier' ? 'Fournisseur' : 'Client'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total HT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total TTC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFactures.map(facture => {
                  const entity = getEntityDetails(facture);
                  
                  return (
                    <tr key={facture.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{facture.reference}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{entity.nom}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(facture.dateEmission)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {facture.totalHT.toFixed(3)} TND
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {facture.totalTTC.toFixed(3)} TND
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          facture.paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {facture.paid ? 'Payée' : 'En attente'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <button
                          onClick={() => handleViewDetails(facture)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDelete(facture.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={() => generateInvoicePDF(facture)}
                          className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => exportToCSV(facture)}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          CSV
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredFactures.length > 0 && (
          <div className="mt-4">
            <Pagination
              pages={pages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
      <FactureDetail 
        facture={selectedFacture}
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        clients={clients}
        suppliers={suppliers}
        articles={articles}
      />
    </div>
  );
};

export default FactureLines;