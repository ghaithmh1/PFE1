import React from 'react';
import { useNavigate } from 'react-router-dom';

const MultipleTabsBlocker = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md p-8 mx-auto mt-10 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="w-16 h-16 text-red-500 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Accès limité
          </h2>
          
          <p className="mb-6 text-gray-600">
            L'application est déjà ouverte dans un autre onglet. 
            Pour des raisons de sécurité et de cohérence des données, 
            vous ne pouvez utiliser l'application que dans un seul onglet à la fois.
          </p>
          
          <div className="flex flex-col space-y-3 w-full">
            <button
              onClick={() => window.close()}
              className="px-4 py-2 font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Fermer cet onglet
            </button>
            
            <button
              onClick={handleLoginRedirect}
              className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Aller à la page de connexion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleTabsBlocker;