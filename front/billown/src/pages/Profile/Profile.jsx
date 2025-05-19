import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../redux/apiCalls/profileApiCall";
import "./Profile.css";
import UpdateProfile from "./UpdateProfile";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.profile);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [updateProfile, setUpdateProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    dispatch(getUserProfile(id));
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  // Mise à jour de l'état de chargement quand profile change
  useEffect(() => {
    if (profile) {
      setIsLoading(false);
    }
  }, [profile]);

  // Gérer la fermeture du modal de mise à jour
  const closeModal = () => {
    setUpdateProfile(false);
  };

  if (isLoading) {
    return (
      <div className="articles-container">
        <div className="articles-card">
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="articles-container">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="articles-card">
        <div className="articles-header">
          <h1 className="articles-title">Profil utilisateur</h1>
        </div>
        
        {profile ? (
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur</label>
              <div className="detail-value">{profile.nom}</div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="detail-value">{profile.email}</div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setUpdateProfile(true)} 
                className="btn btn-primary"
              >
                Modifier le profil
              </button>
            </div>
          </div>
        ) : (
          <div className="empty-message">
            Aucune information de profil disponible
          </div>
        )}
      </div>
      
      {/* Modal pour la mise à jour du profil */}
      {updateProfile && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">Modifier le profil</h2>
              <button
                onClick={closeModal}
                className="modal-close-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <UpdateProfile profile={profile} setUpdateProfile={setUpdateProfile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;