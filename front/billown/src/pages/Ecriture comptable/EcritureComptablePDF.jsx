import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Création des styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '1pt solid #eaeaea',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    marginBottom: 5,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 24,
  },
  tableRowHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  col1: { width: '15%' },
  col2: { width: '45%' },
  col3: { width: '20%' },
  col4: { width: '20%' },
  totals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '20%',
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 10,
    width: '20%',
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    fontSize: 8,
    color: '#9ca3af',
  },
});

// Fonction utilitaire pour formater les dates
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Fonction utilitaire pour formater les montants
const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(montant || 0));
};

// Le composant principal qui génère le PDF
const EcritureComptablePDF = ({ ecriture }) => {
  // Calcul des totaux
  const totalDebit = ecriture.lignes
    .filter(ligne => ligne.debit > 0)
    .reduce((sum, ligne) => sum + parseFloat(ligne.debit || 0), 0);
  
  const totalCredit = ecriture.lignes
    .filter(ligne => ligne.credit > 0)
    .reduce((sum, ligne) => sum + parseFloat(ligne.credit || 0), 0);
  
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = difference < 0.001;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Entête du document */}
        <View style={styles.header}>
          <Text style={styles.title}>Écriture Comptable</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° :</Text>
            <Text style={styles.infoValue}>{ecriture.num || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Référence :</Text>
            <Text style={styles.infoValue}>{ecriture.reference || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>{formatDate(ecriture.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut :</Text>
            <Text style={styles.infoValue}>{ecriture.statut || '-'}</Text>
          </View>
        </View>
        
        {/* Tableau des lignes d'écriture */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail des lignes d'écriture</Text>
          
          <View style={styles.table}>
            {/* Entête du tableau */}
            <View style={[styles.tableRow, styles.tableRowHeader]}>
              <View style={[styles.tableCell, styles.col1]}>
                <Text style={styles.tableCellHeader}>Compte</Text>
              </View>
              <View style={[styles.tableCell, styles.col2]}>
                <Text style={styles.tableCellHeader}>Description</Text>
              </View>
              <View style={[styles.tableCell, styles.col3]}>
                <Text style={styles.tableCellHeader}>Débit</Text>
              </View>
              <View style={[styles.tableCell, styles.col4]}>
                <Text style={styles.tableCellHeader}>Crédit</Text>
              </View>
            </View>
            
            {/* Lignes du tableau */}
            {ecriture.lignes.map((ligne, index) => (
              <View key={`ligne-${index}`} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.col1]}>
                  <Text>
                    {ligne.compte && typeof ligne.compte === 'object' 
                      ? `${ligne.compte.numero || ''}` 
                      : ligne.compte || '-'}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.col2]}>
                  <Text>{ligne.description || '-'}</Text>
                </View>
                <View style={[styles.tableCell, styles.col3]}>
                  <Text>
                    {ligne.debit && ligne.debit > 0 
                      ? `${formatMontant(ligne.debit)} TND` 
                      : ''}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.col4]}>
                  <Text>
                    {ligne.credit && ligne.credit > 0 
                      ? `${formatMontant(ligne.credit)} TND` 
                      : ''}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          
          {/* Totaux */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Débit :</Text>
              <Text style={styles.totalValue}>{formatMontant(totalDebit)} TND</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Crédit :</Text>
              <Text style={styles.totalValue}>{formatMontant(totalCredit)} TND</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Différence :</Text>
              <Text style={[styles.totalValue, isBalanced ? styles.balanced : styles.unbalanced]}>
                {formatMontant(difference)} TND
              </Text>
            </View>
            
          </View>
        </View>
        
        {/* Pied de page */}
        <View style={styles.footer}>
          <Text>Document généré le {formatDate(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default EcritureComptablePDF;