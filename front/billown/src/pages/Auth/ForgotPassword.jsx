import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (email.trim() === "") return toast.error("L'email est obligatoire");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Veuillez entrer un email valide");
    
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setEmailSent(true);
      toast.success("Un email de réinitialisation a été envoyé à votre adresse");
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      
      if (error.response && error.response.status === 404) {
        toast.error("Aucun compte trouvé avec cet email");
      } else {
        toast.error("Erreur lors de l'envoi de l'email de réinitialisation");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        {!emailSent ? (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Réinitialisation du mot de passe
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Entrez votre adresse email pour recevoir un lien de réinitialisation
            </p>
            
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
            </button>
            
            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-600 hover:underline">
                Retour à la page de connexion
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">Email envoyé!</h2>
            <p className="text-gray-600">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.<br />
              Veuillez vérifier votre boîte de réception.
            </p>
            <p className="text-sm text-gray-500">
              Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
            </p>
            <div className="pt-4">
              <Link to="/login" className="text-blue-600 hover:underline">
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;