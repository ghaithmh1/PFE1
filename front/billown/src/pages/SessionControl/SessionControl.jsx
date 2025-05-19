import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import "./SessionControl.css"


const SessionControl = () => {
  const [isBlockedSession, setIsBlockedSession] = useState(false);
  const { user } = useSelector(state => state.auth);
  
  const SESSION_KEY = 'accounting_app_session';
  const SESSION_ID = Date.now().toString();

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, ne pas activer le contrôle de session
    if (!user) return;

    // Fonction pour vérifier si une autre instance est active
    const checkSession = () => {
      const currentSession = localStorage.getItem(SESSION_KEY);
      
      // Si une session existe déjà, et qu'elle est différente de la nôtre
      if (currentSession && currentSession !== SESSION_ID) {
        setIsBlockedSession(true);
        return false;
      }
      
      // Sinon, définir notre propre session
      localStorage.setItem(SESSION_KEY, SESSION_ID);
      return true;
    };

    // Vérifier au chargement
    const sessionValid = checkSession();
    if (!sessionValid) return;

    // Fonction pour gérer les événements de stockage (détecte les changements dans d'autres onglets)
    const handleStorageChange = (event) => {
      if (event.key === SESSION_KEY && event.newValue !== SESSION_ID) {
        setIsBlockedSession(true);
      }
    };

    // Fonction pour signaler que nous sommes toujours actifs
    const pingSession = () => {
      localStorage.setItem(SESSION_KEY, SESSION_ID);
    };

    // Détecter si d'autres onglets sont ouverts
    window.addEventListener('storage', handleStorageChange);
    
    // Ping périodique pour maintenir la session active
    const pingInterval = setInterval(pingSession, 2000);

    // Nettoyer à la fermeture
    const handleBeforeUnload = () => {
      const currentSession = localStorage.getItem(SESSION_KEY);
      if (currentSession === SESSION_ID) {
        localStorage.removeItem(SESSION_KEY);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Nettoyage lors du démontage du composant
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(pingInterval);
      handleBeforeUnload();
    };
  }, [user]);

  // Afficher un message si la session est bloquée
  if (isBlockedSession) {
    return (
      <div className="session-blocked-overlay">
        <div className="session-blocked-message">
          <h2>Application déjà ouverte</h2>
          <p>Cette application de comptabilité est déjà ouverte dans un autre onglet ou fenêtre.</p>
          <p>Pour éviter des conflits dans vos données comptables, veuillez utiliser l'instance existante.</p>
          <button onClick={() => window.close()}>Fermer cet onglet</button>
        </div>
      </div>
    );
  }

  // Si la session est valide, ne rien afficher (ce composant est transparent)
  return null;
};

export default SessionControl;