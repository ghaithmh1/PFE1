import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccountId } from '../hooks/useAccountId';

const UpdateFactureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const accountId = useAccountId();
  
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState([]);
  const [issueDate] = useState(new Date().toISOString().split('T')[0]); // Date générée automatiquement et non modifiable
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('TND');
  const [paid, setPaid] = useState(false);
  const [comment, setComment] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArticleSearch, setShowArticleSearch] = useState(false);
  
  // Totals
  const [totalHT, setTotalHT] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fetch data and populate form
  useEffect(() => {
    const fetchData = async () => {
      console.log("ID brut reçu:", id);
    
      if (!id) {
        setError("ID de facture manquant");
        setLoading(false);
        return;
      }
      
      const numericId = Number(id);
      if (isNaN(numericId)) {
        setError(`ID de facture invalide: "${id}" n'est pas un nombre`);
        setLoading(false);
        return;
      }

      console.log("ID numérique valide:", numericId);
      try {
        const clientsUrl = accountId 
          ? `http://localhost:8080/clients/account/${accountId}` 
          : 'http://localhost:8080/clients';
        const articlesUrl = accountId 
          ? `http://localhost:8080/articles/account/${accountId}` 
          : 'http://localhost:8080/articles';

        const [clientsRes, articlesRes, comptesRes, invoiceRes] = await Promise.all([
          fetch(clientsUrl),
          fetch(articlesUrl),
          fetch('http://localhost:8080/compte'),
          fetch(`http://localhost:8080/factures/${id}`)
        ]);
        
        if (!invoiceRes.ok) {
          throw new Error(`Failed to fetch invoice: ${invoiceRes.status}`);
        }
        
        const clientsData = await clientsRes.json();
        const articlesData = await articlesRes.json();
        const comptesData = await comptesRes.json();
        const invoiceData = await invoiceRes.json();
        
        console.log("Fetched invoice data:", invoiceData);

        setSelectedClient(invoiceData.clientId?.toString() || '');
        
        if (Array.isArray(invoiceData.lignes)) {
          setItems(invoiceData.lignes.map((line, index) => {
            const article = (articlesData.data || articlesData).find(a => a.id === line.articleId);
            
            return {
              id: index + 1,
              articleId: line.articleId?.toString() || '',
              qty: line.quantite || 0,
              price: line.prixUnitaire || 0,
              vat: line.tvaRate || 19,
              compteId: line.compteId?.toString() || '',
              designation: line.designation || (article ? article.designation : 'Unknown Item')
            };
          }));
        } else {
          setItems([]);
        }
        
        // On ne modifie plus issueDate ici, elle est déjà initialisée avec la date actuelle
        setPaymentDate(invoiceData.datePaiement ? invoiceData.datePaiement.split('T')[0] : '');
        setPaymentMethod(invoiceData.paymentMethod || '');
        setCurrency(invoiceData.currency || 'TND');
        setPaid(invoiceData.paid || false);
        setComment(invoiceData.comment || '');
        setDiscount(invoiceData.discount || 0);

        setClients(clientsData.data || clientsData);
        setArticles((articlesData.data || articlesData));
        setComptes(comptesData);
        
        setLoading(false);
        setInitialLoad(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Response data:', await error.response.json());
        }
        setError(error.message);
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    fetchData();
  }, [id, accountId]);

  // Calculate totals
  useEffect(() => {
    if (initialLoad) return;
    
    let ht = 0;
    let vat = 0;
    
    items.forEach(item => {
      const itemHT = item.qty * item.price;
      const itemVAT = itemHT * (item.vat / 100);
      ht += itemHT;
      vat += itemVAT;
    });

    const discountAmount = ht * (discount / 100);
    const ttc = (ht - discountAmount) + vat;

    setTotalHT(ht.toFixed(3));
    setTotalVAT(vat.toFixed(3));
    setTotalTTC(ttc.toFixed(3));
  }, [items, discount, initialLoad]);

  const addItem = (article) => {
    setItems([...items, {
      id: items.length + 1,
      articleId: article.id.toString(),
      qty: 1,
      price: article.prixVente,
      vat: article.tva || 19,
      compteId: '',
      designation: article.designation
    }]);
    setShowArticleSearch(false);
    setSearchQuery('');
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedClient || items.length === 0) {
      alert('Please select a client and add at least one item');
      return;
    }

    const invoiceData = {
      clientId: Number(selectedClient),
      dateEmission: issueDate, // Utilise la date générée automatiquement
      datePaiement: paymentDate || null,
      paymentMethod: paymentMethod.toUpperCase(),
      currency,
      discount: Number(discount),
      paid,
      comment,
      lignes: items.map(item => ({
        compteId: item.compteId ? Number(item.compteId) : null,
        articleId: Number(item.articleId),
        quantite: Number(item.qty),
        prixUnitaire: Number(item.price),
        tvaRate: Number(item.vat)
      }))
    };

    try {
      const response = await fetch(`http://localhost:8080/factures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update invoice');
      }

      await response.json();
      alert('Invoice updated successfully!');
      navigate('/facture-lines');
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert(`Error updating invoice: ${error.message}`);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading invoice data...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading invoice: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Invoice #{id}</h2>
        <form onSubmit={handleSubmit}>
          {/* Client and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select 
                value={selectedClient} 
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.nom}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="TND">TND</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Items</h3>
              <button
                type="button"
                onClick={() => setShowArticleSearch(!showArticleSearch)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Item
              </button>
            </div>

            {showArticleSearch && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-2"
                />
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {articles
                    .filter(article => 
                      article.designation?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(article => (
                      <div
                        key={article.id}
                        onClick={() => addItem(article)}
                        className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                      >
                        <span>{article.designation}</span>
                        <span className="text-gray-500">{article.prixVente}TND</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{item.designation}</td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.vat}
                          onChange={(e) => updateItem(item.id, 'vat', parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border rounded-md"
                        >
                          {[19, 13, 7, 0].map(rate => (
                            <option key={rate} value={rate}>{rate}%</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select
                          value={item.compteId}
                          onChange={(e) => updateItem(item.id, 'compteId', e.target.value)}
                          className="w-36 px-2 py-1 border rounded-md"
                        >
                          <option value="">Select Account</option>
                          {comptes.map(compte => (
                            <option key={compte.id} value={compte.id}>
                              {compte.nom}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dates and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Dates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
                    {formatDisplayDate(issueDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Payment</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select method...</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={paid}
                    onChange={(e) => setPaid(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Mark as Paid</label>
                </div>
              </div>
            </div>
          </div>

          {/* Comment and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                placeholder="Additional notes or terms..."
              />
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal (HT):</span>
                <span className="font-medium">{totalHT} {currency}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-700">Discount:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  %
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-700">VAT:</span>
                <span className="font-medium">{totalVAT} {currency}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="text-gray-800 font-semibold">Total (TTC):</span>
                <span className="text-lg font-bold">{totalTTC} {currency}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateFactureForm;