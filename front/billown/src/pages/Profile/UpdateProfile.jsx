import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateProfile } from "../../redux/apiCalls/profileApiCall";

const UpdateProfile = ({ profile, setUpdateProfile }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    nom: profile?.nom || "",
    email: profile?.email || "",
    password: "",
    confirmPassword: ""
  });

  // Gérer les changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    // Validation du nom
    if (!formData.nom.trim()) {
      toast.error("Le nom d'utilisateur ne peut pas être vide");
      return false;
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      toast.error("L'email ne peut pas être vide");
      return false;
    }
    
    // Validation du format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Veuillez entrer un email valide");
      return false;
    }
    
    // Vérification des mots de passe
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }
    
    return true;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Valider le formulaire avant soumission
    if (!validateForm()) return;
    
    try {
      // Créer l'objet de données à envoyer
      const updatedData = {
        nom: formData.nom,
        email: formData.email,
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        updatedData.password = formData.password;
      }
      
      // Envoyer la mise à jour
      await dispatch(updateProfile(profile.id, updatedData));
      toast.success("Profil mis à jour avec succès");
      
      // Fermer le modal
      setUpdateProfile(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error("Erreur mise à jour profil:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Confirmer mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="form-input"
            disabled={!formData.password}
          />
        </div>
        
      </div>
      
      <div className="modal-footer">
        <button
          type="button"
          onClick={() => setUpdateProfile(false)}
          className="btn btn-cancel"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Mettre à jour
        </button>
      </div>
    </form>
  );
};

export default UpdateProfile;