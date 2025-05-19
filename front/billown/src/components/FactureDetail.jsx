import React from "react";
import { Link } from 'react-router-dom';

const FactureDetail = ({ 
  facture, 
  showDetailsModal, 
  setShowDetailsModal,
  clients,
  suppliers,
  articles
}) => {
  if (!showDetailsModal || !facture) return null;
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Trouver l'entité (client ou fournisseur)
  const getEntityDetails = () => {
    if (facture.clientId) {
      return clients.find(c => c.id === facture.clientId) || {};
    } else if (facture.fournisseurId) {
      return suppliers.find(s => s.id === facture.fournisseurId) || {};
    }
    return {};
  };

  const entity = getEntityDetails();
  const entityType = facture.clientId ? 'Client' : 'Fournisseur';

  return (
    <div className="client-detail-overlay">
      <div className="client-detail-backdrop" onClick={() => setShowDetailsModal(false)}></div>
      
      <div className="client-detail-container" style={{ maxWidth: '800px' }}>
        <div className="client-detail-header">
          <div className="client-detail-header-content">
            <h2 className="client-detail-title">Détails de la Facture</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="client-detail-close-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="close-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="client-detail-body">
          <div className="client-detail-grid">
            <div className="detail-item">
              <label className="detail-label">Référence</label>
              <div className="detail-value">{facture.reference}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Date d'émission</label>
              <div className="detail-value">{formatDate(facture.dateEmission)}</div>
            </div>
            {facture.datePaiement && (
              <div className="detail-item">
                <label className="detail-label">Date de paiement</label>
                <div className="detail-value">{formatDate(facture.datePaiement)}</div>
              </div>
            )}
            <div className="detail-item">
              <label className="detail-label">{entityType}</label>
              <div className="detail-value">{entity.nom || '-'}</div>
            </div>
                        <div className="detail-item">
              <label className="detail-label">Statut</label>
              <div className="detail-value">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  facture.paid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {facture.paid ? 'Payée' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Lignes de facture</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unitaire</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant HT</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant TTC</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facture.lignes?.map((ligne, index) => {
                    const article = articles.find(a => a.id === ligne.articleId) || {};
                    const htAmount = ligne.prixUnitaire * ligne.quantite;
                    const ttcAmount = htAmount * (1 + (ligne.tvaRate / 100));
                    
                    return (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {article.designation || 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {ligne.prixUnitaire.toFixed(3)} TND
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {ligne.quantite}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {ligne.tvaRate}%
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {htAmount.toFixed(3)} TND
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {ttcAmount.toFixed(3)} TND
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-500">Total HT</h4>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {facture.totalHT?.toFixed(3) || '0.000'} TND
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-500">Total TVA</h4>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {(facture.totalTTC - facture.totalHT)?.toFixed(3) || '0.000'} TND
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm font-medium text-gray-500">Total TTC</h4>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {facture.totalTTC?.toFixed(3) || '0.000'} TND
              </p>
            </div>
          </div>

          {facture.paidAmount !== undefined && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="text-sm font-medium text-gray-500">Montant Payé</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {facture.paidAmount?.toFixed(3) || '0.000'} TND
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <h4 className="text-sm font-medium text-gray-500">Solde Restant</h4>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {(facture.totalTTC - (facture.paidAmount || 0))?.toFixed(3) || '0.000'} TND
                </p>
              </div>
            </div>
          )}
          
          <div className="client-detail-footer">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="btn btn-cancel"
            >
              Fermer
            </button>
            <Link 
                to={`/update-facture/${facture.id}`}
              onClick={() => setShowDetailsModal(false)}
              className="btn btn-primary"
            >
              Modifier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureDetail;