import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../redux/apiCalls/authApiCall";

const SignUp = () => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registerMessage } = useSelector(state => state.auth);
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    // Validation des champs
    if (nom.trim() === "") return toast.error("Le nom d'utilisateur est obligatoire");
    if (email.trim() === "") return toast.error("L'email est obligatoire");
    if (motDePasse.trim() === "") return toast.error("Le mot de passe est obligatoire");
    if (motDePasse !== confirmPassword) return toast.error("Les mots de passe ne correspondent pas");
    if (!acceptTerms) return toast.error("Veuillez accepter les conditions d'utilisation");
    
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Veuillez entrer un email valide");
    
    // Validation basique du mot de passe (minimum 8 caractères pour correspondre au backend)
    if (motDePasse.length < 8) return toast.error("Le mot de passe doit contenir au moins 8 caractères");
    
    setIsLoading(true);
    try {
      await dispatch(registerUser({nom, email, motDePasse}));
      toast.success("Inscription réussie! Redirection...");
      setTimeout(() => {
        navigate("/login");
      }, 2000); 
    }   
      catch (error) {
      // Les erreurs sont déjà gérées dans l'action Redux avec toast
      console.error("Erreur lors de l'inscription:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Créer un compte</h2>
        
        <form className="space-y-6" onSubmit={handleSignUp} noValidate>
          <div className="space-y-2">
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="nom"
              placeholder="Entrez votre nom d'utilisateur"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
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
          
          <div className="space-y-2">
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="motDePasse"
              placeholder="Entrez votre mot de passe (8 caractères minimum)"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="block ml-2 text-sm text-gray-700">
              J'accepte les <a href="/terms" className="text-blue-600 hover:underline">conditions d'utilisation</a>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-full border-gray-300" />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Vous avez déjà un compte ? 
              <Link to="/login" className="ml-1 text-gray-800 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;