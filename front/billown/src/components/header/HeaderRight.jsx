import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { logoutUser } from "../../redux/apiCalls/authApiCall";
const HeaderRight = () => {
  const { user } = useSelector((state) => state.auth);
  console.log("User dans HeaderRight:", user);
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Utiliser l'ID d'utilisateur comme texte affiché si le nom n'existe pas
  const displayName = user?.nom || `Utilisateur #${user?.userId}`;

  // Effet pour gérer les clics en dehors du dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };

    // Ajout de l'écouteur d'événement lorsque le dropdown est ouvert
    if (dropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Nettoyage de l'écouteur d'événement
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdown]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="header-right">
      {user ? (
        <div className="header-right-user-info">
          <span 
            onClick={() => setDropdown((prev) => !prev)}
            className="header-right-username"
          >
            {displayName}
          </span>
          
          {dropdown && (
            <div className="header-right-dropdown" ref={dropdownRef}>
              <Link 
                to={`/profile/${user?.userId}`}
                className="header-dropdown-item"
                onClick={() => setDropdown(false)}
              >
                <i className="bi bi-file-person"></i>
                <span>Profile</span>
              </Link>
              <div onClick={handleLogout} className="header-dropdown-item">
                <i className="bi bi-box-arrow-left"></i>
                <span>Déconnexion</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Link to="/login" className="header-right-link">
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Connexion</span>
          </Link>

          <Link to="/signUp" className="header-right-link">
            <i className="bi bi-person-plus"></i>
            <span>S'inscrire</span>
          </Link>
        </>
      )}
    </div>
  );
};
export default HeaderRight;