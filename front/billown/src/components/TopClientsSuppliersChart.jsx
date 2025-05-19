import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import axios from 'axios';

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TopClientsSuppliersChart = ({ accountId }) => {
const [topClients, setTopClients] = useState([]);
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Couleurs pour les graphiques
  const clientColors = [
    'rgba(54, 162, 235, 0.8)',  // bleu
    'rgba(54, 162, 235, 0.6)',
    'rgba(54, 162, 235, 0.4)',
    'rgba(54, 162, 235, 0.3)',
    'rgba(54, 162, 235, 0.2)'
  ];

  const supplierColors = [
    'rgba(255, 99, 132, 0.8)',  // rose
    'rgba(255, 99, 132, 0.6)',
    'rgba(255, 99, 132, 0.4)',
    'rgba(255, 99, 132, 0.3)',
    'rgba(255, 99, 132, 0.2)'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les données des clients
        const clientsResponse = await axios.get(`http://localhost:8080/clients/account/${accountId}`);
        const clientsData = clientsResponse.data.data || [];
        
        // Récupérer les données des fournisseurs
        const suppliersResponse = await axios.get(`http://localhost:8080/fournisseurs/account/${accountId}`);
        const suppliersData = suppliersResponse.data || [];
        
        // Récupérer les factures
        const invoicesResponse = await axios.get('http://localhost:8080/factures');
        const invoicesData = invoicesResponse.data || [];
        
        // Calculer les totaux pour les clients
        const clientsWithTotals = clientsData.map(client => {
          const clientInvoices = invoicesData.filter(invoice => invoice.clientId === client.id);
          const total = clientInvoices.reduce((sum, invoice) => sum + (invoice.totalTTC || 0), 0);
          return {
            ...client,
            total: total
          };
        });
        
        // Calculer les totaux pour les fournisseurs
        const suppliersWithTotals = suppliersData.map(supplier => {
          const supplierInvoices = invoicesData.filter(invoice => invoice.fournisseurId === supplier.id);
          const total = supplierInvoices.reduce((sum, invoice) => sum + (invoice.totalTTC || 0), 0);
          return {
            ...supplier,
            total: total
          };
        });
        
        // Trier et garder les top 5
        setTopClients(
          clientsWithTotals
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        );
        
        setTopSuppliers(
          suppliersWithTotals
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
        );
        
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
        setIsLoading(false);
      }
    };

    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  // Préparer les données pour le graphique des clients
  const clientsChartData = {
    labels: topClients.map(client => client.nom),
    datasets: [{
      label: 'Montant total (TND)',
      data: topClients.map(client => client.total),
      backgroundColor: clientColors,
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  // Préparer les données pour le graphique des fournisseurs
  const suppliersChartData = {
    labels: topSuppliers.map(supplier => supplier.nom),
    datasets: [{
      label: 'Montant total (TND)',
      data: topSuppliers.map(supplier => supplier.total),
      backgroundColor: supplierColors,
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // Options communes pour les deux graphiques
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} TND`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant (TND)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Nom'
        }
      }
    }
  };

  if (!accountId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">Veuillez sélectionner un compte</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800">Chargement des données en cours...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }
  return (
  <div className="flex flex-col md:flex-row gap-8 w-full h-full min-h-[600px]">
    <div className="bg-white p-6 rounded-lg shadow flex-1">
      <h2 className="text-xl font-semibold mb-6">Top 5 Clients</h2>
      <div className="h-[400px] w-full">
        <Bar 
          data={clientsChartData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: {
                display: true,
                text: 'Clients avec le plus gros chiffre d\'affaires',
                font: {
                  size: 16
                }
              }
            },
            maintainAspectRatio: false // Ajouté pour permettre le redimensionnement libre
          }} 
        />
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow flex-1">
      <h2 className="text-xl font-semibold mb-6">Top 5 Fournisseurs</h2>
      <div className="h-[400px] w-full">
        <Bar 
          data={suppliersChartData} 
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: {
                display: true,
                text: 'Fournisseurs avec le plus gros montant dépensé',
                font: {
                  size: 16
                }
              }
            },
            maintainAspectRatio: false // Ajouté pour permettre le redimensionnement libre
          }} 
        />
      </div>
    </div>
  </div>
);
};

export default TopClientsSuppliersChart;