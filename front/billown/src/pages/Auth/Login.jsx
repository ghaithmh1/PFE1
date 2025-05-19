import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux"
import { loginUser } from "../../redux/apiCalls/authApiCall";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation des champs
    if (email.trim() === "") return toast.error("L'email est obligatoire");
    if (password.trim() === "") return toast.error("Le mot de passe est obligatoire");
        
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return toast.error("Veuillez entrer un email valide");
    
    setIsLoading(true);
    try {
      await dispatch(loginUser({ email, password }));
      setTimeout(() => {
        navigate("/dashboard", { replace: true }); 
      }, 3000);
       } 
      catch (error) {
        console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
        
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <form className="space-y-6" onSubmit={handleLogin} noValidate>
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              id="password" 
              placeholder="Entrez votre mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Mot de passe oublié?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-full">
              <hr className="w-full border-gray-300" />
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Vous n'avez pas de compte ? 
              <Link to="/signup" className="ml-1 text-gray-800 hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;