import { Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const Navbar = ({ toggle, setToggle }) => {
  const [isComptabiliteOpen, setIsComptabiliteOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useSelector(state => state.auth);
  
  // Fonction pour fermer le menu comptabilité et le toggle mobile
  const handleMenuItemClick = () => {
    setIsComptabiliteOpen(false);
    setToggle(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isComptabiliteOpen && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setIsComptabiliteOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isComptabiliteOpen]);
  
  return (
    <nav
      style={{ clipPath: toggle && "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      className="navbar"
    >
      {
        user ? (
          <ul className="nav-links">
            <Link to="/dashboard" onClick={handleMenuItemClick} className="nav-link">
              <i className="bi bi-house"></i> Tableau de bord
            </Link>

            <Link to="/about" onClick={handleMenuItemClick} className="nav-link">
              <i class="bi bi-file-earmark-person"></i> A propos
            </Link>
            
            <Link to="/facture" onClick={handleMenuItemClick} className="nav-link">
              <i className="bi bi-receipt-cutoff"></i> Facture
            </Link>
            <Link to="/articles" onClick={handleMenuItemClick} className="nav-link">
              <i className="bi bi-cart3"></i> Article
            </Link>
            <Link to="/clients" onClick={handleMenuItemClick} className="nav-link">
              <i className="bi bi-person"></i> Client
            </Link>
            <Link to="/fournisseur" onClick={handleMenuItemClick} className="nav-link">
              <i className="bi bi-person-lines-fill"></i> Fournisseur 
            </Link>
            
            <div className="comptabilite-menu" ref={dropdownRef}>
              <button 
                onClick={() => setIsComptabiliteOpen(!isComptabiliteOpen)} 
                className={`nav-link comptabilite-toggle ${isComptabiliteOpen ? 'active' : ''}`}
              >
                <div className="comptabilite-label">
                  <i className="bi bi-calculator"></i> Comptabilité
                </div>
              </button>
              
              {isComptabiliteOpen && (
                <div className="comptabilite-dropdown">
                  <Link to="/plan-comptable" onClick={handleMenuItemClick} className="dropdown-item">
                    <i className="bi bi-journal-text"></i> Plan comptable
                  </Link>
                  <Link to="/ecritures-comptables" onClick={handleMenuItemClick} className="dropdown-item">
                    <i className="bi bi-pencil-square"></i> Écritures Comptable
                  </Link>
                  <Link to="/grand-livre" onClick={handleMenuItemClick} className="dropdown-item">
                    <i className="bi bi-arrow-right"></i> Grands Livres
                  </Link>
                  <Link to="/balance" onClick={handleMenuItemClick} className="dropdown-item">
                    <i className="bi bi-arrow-repeat"></i> Balances
                  </Link>
                </div>
              )}
            </div>
          </ul>
        ) :(
          <>
            <Link to="/about" onClick={handleMenuItemClick} className="nav-link">
              <i class="bi bi-file-earmark-person"></i> A propos
            </Link>
          </>
        )
      }
    </nav>
  );
};

export default Navbar;