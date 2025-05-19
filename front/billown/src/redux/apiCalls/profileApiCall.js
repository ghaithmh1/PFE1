import axios from "axios";
import { toast } from "react-toastify";
import { profileActions } from "../slices/profileSlice";
import { authActions } from "../slices/authslice"

// Récupérer le profil de l'utilisateur
export function getUserProfile(userId) {
  return async (dispatch) => {
    try {
      const { data } = await axios.get(`http://localhost:8080/utilisateurs/profile/${userId}`);
      dispatch(profileActions.setProfile(data.data));
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la récupération du profil");
      throw error;
    }
  };
}

export function updateProfile (userId, profile){
  return async (dispatch, getState) => {
    try {
      const { data } = await axios.put(`http://localhost:8080/utilisateurs/profile/${userId}`, profile, {
        headers: {
          Authorization: "Bearer " + getState().auth.user.token,
        },
      });
      const updatedUser = data.data;
      dispatch(profileActions.updateProfile(updatedUser));
      if (updatedUser.nom) {
        dispatch(authActions.setNom(updatedUser.nom));
        
        const user = JSON.parse(localStorage.getItem("userInfo"));
        user.nom = updatedUser.nom;
        localStorage.setItem("userInfo", JSON.stringify(user));
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
}
