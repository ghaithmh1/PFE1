import React from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Enregistrement des composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RevenueExpenseTrend = ({ monthlyData }) => {
  // Vérification que monthlyData est bien défini et non vide
  console.log("RevenueExpenseTrend reçoit:", monthlyData);
  
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="no-data-message" style={{ 
        textAlign: 'center', 
        padding: '20px', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        height: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        Aucune donnée disponible pour afficher le graphique
      </div>
    );
  }

  // Préparation des données pour Chart.js
  const data = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Revenus',
        data: monthlyData.map(item => item.revenue),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3
      },
      {
        label: 'Dépenses',
        data: monthlyData.map(item => item.expense),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3
      }
    ]
  };

  // Configuration des options du graphique
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Évolution Mensuelle Revenus/Dépenses',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 10 }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(3)} TND`;
          }
        }
      },
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Montant (TND)',
          font: { size: 12 }
        },
        ticks: {
          callback: function(value) {
            return value.toFixed(3) + ' TND';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois',
          font: { size: 12 }
        }
      }
    }
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default RevenueExpenseTrend;