import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const FactureStatusChart = ({ factures }) => {
  const chartRef = useRef(null);

  const getFactureStatus = (facture) => {
    if (facture.paid) return 'payée';
    
    const today = new Date();
    const paymentDate = new Date(facture.paymentDate);
    
    if (facture.paymentDate && paymentDate < today) {
      return 'en retard';
    }
    
    return 'impayée';
  };

  // Organiser les factures par statut
  const organizeFacturesByStatus = () => {
    const organized = {
      payée: [],
      impayée: [],
      'en retard': []
    };

    factures.forEach(facture => {
      const status = getFactureStatus(facture);
      organized[status].push(facture);
    });

    return organized;
  };

  const facturesByStatus = organizeFacturesByStatus();
  const stats = {
    payée: facturesByStatus.payée.length,
    impayée: facturesByStatus.impayée.length,
    'en retard': facturesByStatus['en retard'].length
  };

  const data = {
    labels: ['Payées', 'Impayées', 'En retard'],
    datasets: [
      {
        data: [stats.payée, stats.impayée, stats['en retard']],
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444'
        ],
        borderColor: [
          '#047857',
          '#D97706',
          '#DC2626'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            
            // Récupérer les références des factures pour ce statut
            const statusKey = ['payée', 'impayée', 'en retard'][context.dataIndex];
            const facturesList = facturesByStatus[statusKey]
              .map(f => f.reference)
              .join(', ');
            
            return [
              `${label}: ${value} (${percentage}%)`,
              `Références: ${facturesList || 'Aucune'}`
            ];
          }
        }
      }
    },
    cutout: '70%',
  };

  return (
    <div className="chart-container" style={{ position: 'relative', height: '300px', width: '100%' }}>
      <Doughnut ref={chartRef} data={data} options={options} />
      
      <div className="chart-summary" style={{ 
        textAlign: 'center', 
        marginTop: '1rem',
        fontSize: '0.9rem',
        color: '#4B5563'
      }}>
        <p>Total factures: {factures.length}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <div>
            <span style={{ color: '#10B981' }}>●</span> Payées: {stats.payée}
          </div>
          <div>
            <span style={{ color: '#F59E0B' }}>●</span> Impayées: {stats.impayée}
          </div>
          <div>
            <span style={{ color: '#EF4444' }}>●</span> Retard: {stats['en retard']}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactureStatusChart;