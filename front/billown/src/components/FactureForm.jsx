import React, { useState, useEffect } from 'react';
import { useAccountId } from '../hooks/useAccountId';

const FactureForm = ({ onSuccess, onClose }) => {
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [invoiceType, setInvoiceType] = useState('client');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('TND');
  const [paid, setPaid] = useState(false);
  const [paymentDate, setPaymentDate] = useState('');
  const [issueDate] = useState(new Date().toISOString().split('T')[0]); // Date générée automatiquement et non modifiable
  const [comment, setComment] = useState('');
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArticleSearch, setShowArticleSearch] = useState(false);

  // Totals
  const [totalHT, setTotalHT] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const accountId = useAccountId();
  
  // Format date for backend
  const formatDateForBackend = (dateString) => {
    if (!dateString) return null;
    return dateString;
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsRes, suppliersRes, articlesRes, comptesRes] = await Promise.all([
          fetch(`http://localhost:8080/clients/account/${accountId}`),
          fetch(`http://localhost:8080/fournisseurs/account/${accountId}`),
          fetch(`http://localhost:8080/articles/account/${accountId}`),
          fetch('http://localhost:8080/compte')
        ]);
        
        const clientsData = await clientsRes.json();
        const suppliersData = await suppliersRes.json();
        const articlesData = await articlesRes.json();
        const comptesData = await comptesRes.json();

        setClients(clientsData.data || []);
        setSuppliers(suppliersData);
        setArticles(articlesData || []);
        setComptes(comptesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate totals
  useEffect(() => {
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
  }, [items, discount]);

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

    if (!selectedEntity || items.length === 0) {
      alert(`Please select a ${invoiceType} and add at least one item`);
      return;
    }

    const invoiceData = {
      [invoiceType === 'client' ? 'clientId' : 'fournisseurId']: Number(selectedEntity),
      paymentMethod: paymentMethod.toUpperCase(),
      currency,
      discount: Number(discount),
      paid,
      issueDate: formatDateForBackend(issueDate),
      paymentDate: formatDateForBackend(paymentDate),
      comment,
      lignes: items.map(item => ({
        compteId: Number(item.compteId),
        articleId: Number(item.articleId),
        quantite: Number(item.qty),
        prixUnitaire: Number(item.price),
        tvaRate: Number(item.vat)
      }))
    };

    try {
      const response = await fetch('http://localhost:8080/factures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      await response.json();
      alert('Invoice created successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting invoice:', error);
      alert(`Error creating invoice: ${error.message}`);
    }
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Create New Invoice</h2>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setInvoiceType('client')}
            className={`px-4 py-2 rounded-md ${
              invoiceType === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => setInvoiceType('supplier')}
            className={`px-4 py-2 rounded-md ${
              invoiceType === 'supplier' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            Supplier
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {invoiceType === 'client' ? 'Client' : 'Supplier'}
            </label>
            <select 
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select {invoiceType}...</option>
              {(invoiceType === 'client' ? clients : suppliers).map(entity => (
                <option key={entity.id} value={entity.id}>{entity.nom}</option>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <div className="w-full px-3 py-2 border rounded-md bg-gray-100">
              {formatDisplayDate(issueDate)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-700">Items</h3>
            <button
              type="button"
              onClick={() => setShowArticleSearch(!showArticleSearch)}
              className="text-blue-600 hover:text-blue-700 text-sm"
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
                    article.designation.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(article => (
                    <div
                      key={article.id}
                      onClick={() => addItem(article)}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {article.designation} - {article.prixVente}TND
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Item', 'Qty', 'Price', 'VAT', 'Account', 'Actions'].map((header, idx) => (
                    <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.designation}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                        className="w-24 px-2 py-1 border rounded-md"
                      />
                    </td>
                    <td>
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
                    <td>
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
                    <td>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            <h3 className="font-medium text-gray-700 mb-3">Totals</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total HT:</span>
                <span>{totalHT} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT:</span>
                <span>{totalVAT} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value))}
                    className="w-20 px-2 py-1 border rounded-md"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  %
                </div>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total TTC:</span>
                <span>{totalTTC} {currency}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows="3"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default FactureForm;