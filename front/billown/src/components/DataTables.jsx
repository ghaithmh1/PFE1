import React, { useEffect, useState } from 'react';

const DataTables = () => {
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [compte, setCompte] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingCompte, setLoadingCompte] = useState(true);
  const [loadingFactures, setLoadingFactures] = useState(true);

  // Fetch data for clients
  useEffect(() => {
    fetch('http://localhost:8080/clients')
      .then(response => response.json())
      .then(data => {
        setClients(data);
        setLoadingClients(false);
      })
      .catch(error => {
        console.error('Error fetching clients:', error);
        setLoadingClients(false);
      });
  }, []);

  // Fetch data for articles
  useEffect(() => {
    fetch('http://localhost:8080/articles')
      .then(response => response.json())
      .then(data => {
        setArticles(data.data);
        setLoadingArticles(false);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setLoadingArticles(false);
      });
  }, []);

  // Fetch data for compte
  useEffect(() => {
    fetch('http://localhost:8080/compte')
      .then(response => response.json())
      .then(data => {
        setCompte(data);
        setLoadingCompte(false);
      })
      .catch(error => {
        console.error('Error fetching compte:', error);
        setLoadingCompte(false);
      });
  }, []);

  // Fetch data for factures
  useEffect(() => {
    fetch('http://localhost:8080/factures')
      .then(response => response.json())
      .then(data => {
        setFactures(data);
        setLoadingFactures(false);
      })
      .catch(error => {
        console.error('Error fetching factures:', error);
        setLoadingFactures(false);
      });
  }, []);

  // Render loading state or the tables
  if (loadingClients || loadingArticles || loadingCompte || loadingFactures) {
    return <p>Loading...</p>;
  }

  // Function to get client name by clientId
  const getClientName = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.nom : 'Unknown';
  };

  return (
    <div className="container mt-4">
      {/* Clients Table */}
      <h2>Clients</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Identifiant</th>
            <th>Tel</th>
            <th>Fax</th>
            <th>Email</th>
            <th>Country</th>
            <th>Address</th>
            <th>Postal Code</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.nom}</td>
              <td>{client.identifiant}</td>
              <td>{client.tel}</td>
              <td>{client.fax}</td>
              <td>{client.email}</td>
              <td>{client.pays}</td>
              <td>{client.adresse}</td>
              <td>{client.codePostal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Articles Table */}
      <h2>Articles</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Designation</th>
            <th>Reference</th>
            <th>Description</th>
            <th>Prix Vente</th>
            <th>Prix Achat</th>
            <th>Note</th>
            <th>TVA</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(article => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td>{article.designation}</td>
              <td>{article.reference}</td>
              <td>{article.description}</td>
              <td>{article.prixVente}</td>
              <td>{article.prixAchat}</td>
              <td>{article.note}</td>
              <td>{article.tva}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Compte Table */}
      <h2>Compte</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Numero</th>
            <th>Nom</th>
            <th>Classe ID</th>
            <th>Classe Nom</th>
            <th>Parent ID</th>
            <th>Parent Numero</th>
          </tr>
        </thead>
        <tbody>
          {compte.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.numero}</td>
              <td>{c.nom}</td>
              <td>{c.classeId}</td>
              <td>{c.classeNom}</td>
              <td>{c.parentId}</td>
              <td>{c.parentNumero}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Factures Table */}
      <h2>Factures</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Reference</th>
            <th>Client Name</th>
            <th>Payment Method</th>
            <th>Currency</th>
            <th>Discount</th>
            <th>Paid</th>
            <th>Total HT</th>
            <th>Total TVA</th>
            <th>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {factures.map(facture => (
            <tr key={facture.id}>
              <td>{facture.id}</td>
              <td>{facture.reference}</td>
              <td>{getClientName(facture.clientId)}</td> {/* Display client name */}
              <td>{facture.paymentMethod}</td>
              <td>{facture.currency}</td>
              <td>{facture.discount}</td>
              <td>{facture.paid ? 'Yes' : 'No'}</td>
              <td>{facture.totalHT}</td>
              <td>{facture.totalTVA}</td>
              <td>{facture.totalTTC}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTables;
