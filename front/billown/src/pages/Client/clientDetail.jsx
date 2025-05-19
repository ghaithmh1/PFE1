import React from "react";

const ClientDetail = ({ 
  detailsClient, 
  showDetailsModal, 
  setShowDetailsModal, 
  handleEdit 
}) => {
  if (!showDetailsModal || !detailsClient) return null;
  
  return (
    <div className="client-detail-overlay">
      <div className="client-detail-backdrop" onClick={() => setShowDetailsModal(false)}></div>
      
      <div className="client-detail-container">
        <div className="client-detail-header">
          <div className="client-detail-header-content">
            <h2 className="client-detail-title">Détails du client</h2>
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
              <label className="detail-label">Client</label>
              <div className="detail-value">{detailsClient.nom}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Identifiant</label>
              <div className="detail-value">{detailsClient.identifiant}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Tel</label>
              <div className="detail-value">{detailsClient.tel}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Fax</label>
              <div className="detail-value">{detailsClient.fax || '-'}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Email</label>
              <div className="detail-value">{detailsClient.email}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Pays</label>
              <div className="detail-value">{detailsClient.pays || '-'}</div>
            </div>
            <div className="detail-item">
              <label className="detail-label">Code Postal</label>
              <div className="detail-value">{detailsClient.codePostal || '-'}</div>
            </div>
            <div className="detail-item detail-item-full">
              <label className="detail-label">Adresse</label>
              <div className="detail-value">{detailsClient.adresse || '-'}</div>
            </div>
          </div>
          
          <div className="client-detail-footer">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="btn btn-cancel"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                handleEdit(detailsClient);
              }}
              className="btn btn-primary"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;