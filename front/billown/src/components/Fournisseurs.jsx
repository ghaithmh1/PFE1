import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Fournisseurs = () => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFournisseur, setCurrentFournisseur] = useState({
    id: null,
    nom: "",
    identifiant: "",
    matriculeFiscale: "",
    tel: "",
    fax: "",
    email: "",
    pays: "",
    adresse: "",
    codePostal: ""
  });

  
  

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const fetchFournisseurs = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/fournisseurs");
      setFournisseurs(response.data);
    } catch (err) {
      handleApiError(err, "Erreur lors de la récupération des fournisseurs");
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, defaultMessage) => {
    console.error(defaultMessage, error);
    
    if (error.response) {
      switch (error.response.status) {
        case 400:
          toast.error(error.response.data?.message || "Données invalides");
          break;
        case 404:
          toast.error("Ressource non trouvée");
          break;
        case 500:
          toast.error("Erreur serveur. Veuillez réessayer plus tard.");
          break;
        default:
          toast.error(error.response.data?.message || defaultMessage);
      }
    } else if (error.request) {
      toast.error("Impossible de se connecter au serveur");
    } else {
      toast.error("Erreur de configuration de la requête");
    }
  };

  const validateForm = () => {
    if (!currentFournisseur.nom.trim()) {
      toast.error("Le nom du fournisseur ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.identifiant.trim()) {
      toast.error("L'identifiant ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.matriculeFiscale.trim()) {
      toast.error("Le matricule fiscal ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.tel.trim()) {
      toast.error("Le téléphone ne peut pas être vide");
      return false;
    }
    if (!currentFournisseur.email.trim()) {
      toast.error("L'email ne peut pas être vide");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(currentFournisseur.email)) {
      toast.error("Veuillez entrer un email valide");
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentFournisseur(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editMode) {
        await axios.put(`http://localhost:8080/fournisseurs/${currentFournisseur.id}`, currentFournisseur);
        toast.success("Fournisseur mis à jour avec succès");
      } else {
        await axios.post("http://localhost:8080/fournisseurs", currentFournisseur);
        toast.success("Fournisseur ajouté avec succès");
      }
      fetchFournisseurs();
      closeModal();
    } catch (err) {
      handleApiError(err, "Erreur lors de l'enregistrement du fournisseur");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur?")) {
      try {
        await axios.delete(`http://localhost:8080/fournisseurs/${id}`);
        toast.success("Fournisseur supprimé avec succès");
        fetchFournisseurs();
      } catch (err) {
        handleApiError(err, "Erreur lors de la suppression du fournisseur");
      }
    }
  };

  const handleEdit = (fournisseur) => {
    setCurrentFournisseur(fournisseur);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentFournisseur({
      id: null,
      nom: "",
      identifiant: "",
      matriculeFiscale: "",
      tel: "",
      fax: "",
      email: "",
      pays: "",
      adresse: "",
      codePostal: ""
    });
    setEditMode(false);
  };

  const handleAddFournisseur = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="flex pt-6 px-6 gap-6">
        <div className="rounded-lg overflow-hidden">
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Gestion des Fournisseurs</h1>
            <button
              onClick={handleAddFournisseur}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300 ease-in-out transform hover:-translate-y-1 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Ajouter un Fournisseur
            </button>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Liste des Fournisseurs</h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : fournisseurs.length === 0 ? (
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <p className="text-gray-600">Aucun fournisseur trouvé</p>
                <button 
                  onClick={handleAddFournisseur}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ajouter votre premier fournisseur
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifiant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule Fiscale</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fournisseurs.map((fournisseur) => (
                      <tr key={fournisseur.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fournisseur.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fournisseur.nom}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{fournisseur.identifiant}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{fournisseur.matriculeFiscale}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fournisseur.tel}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{fournisseur.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button 
                            onClick={() => handleEdit(fournisseur)}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                          >
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Éditer
                            </span>
                          </button>
                          <button 
                            onClick={() => handleDelete(fournisseur.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          >
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Supprimer
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto flex items-center justify-center">
          <div className="absolute inset-0" onClick={closeModal}></div>
          
          <div className="relative bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden animate-fadeIn" style={{boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'}}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editMode ? "Modifier le fournisseur" : "Ajouter un nouveau fournisseur"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={currentFournisseur.nom}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identifiant
                    </label>
                    <input
                      type="text"
                      name="identifiant"
                      value={currentFournisseur.identifiant}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matricule Fiscale
                    </label>
                    <input
                      type="text"
                      name="matriculeFiscale"
                      value={currentFournisseur.matriculeFiscale}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="text"
                      name="tel"
                      value={currentFournisseur.tel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fax
                    </label>
                    <input
                      type="text"
                      name="fax"
                      value={currentFournisseur.fax}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={currentFournisseur.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      name="pays"
                      value={currentFournisseur.pays}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      name="codePostal"
                      value={currentFournisseur.codePostal}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={currentFournisseur.adresse}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {editMode ? "Mettre à jour" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fournisseurs;