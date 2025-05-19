import axios from "axios";
import { authActions } from "../slices/authslice";
import { toast } from "react-toastify";

// Login User
export function loginUser(user) {
    return async (dispatch) => {
      try {
        const { data } = await axios.post("http://localhost:8080/utilisateurs/login",user);
        
        dispatch(authActions.login(data));
        localStorage.setItem("userInfo", JSON.stringify(data));
        toast.success("Connexion réussie!");
        return data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Erreur de connexion";
        toast.error(errorMessage);
        throw error;
      }
    }
}

// Logout User
export function logoutUser() {
  return (dispatch) => {
    dispatch(authActions.logout());
    localStorage.removeItem("userInfo");
  }
}

// Register User
export function registerUser(user) {
  return async (dispatch) => {
    try {
      
      const { data } = await axios.post("http://localhost:8080/utilisateurs/register", {
        nom: user.nom,
        email: user.email,
        password: user.motDePasse,
      });
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'inscription";
      
      // Affichage de l'erreur
      toast.error(errorMessage);
      throw error;
    }
  }
}