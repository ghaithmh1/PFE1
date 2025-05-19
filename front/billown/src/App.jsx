import React, { useEffect, useState } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  BrowserRouter
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "./components/header/Header";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Home from "./pages/Dashboard/Home";
import Profile from "./pages/Profile/Profile";
import Facture from "./components/Facture";
import Client from "./pages/Client/Clients";
import Articles from "./pages/Article/Articles";
import PlanComptable from "./components/PlanComptable";
import EcritureComptable from "./pages/Ecriture comptable/EcritureComptable";
import DataTables from "./components/DataTables";
import UpdateFactureForm from "./components/UpdateFactureForm";
import FactureForm from "./components/FactureForm";
import FactureLines from "./components/FactureLines";
import EcrituresComptablesForm from "./pages/Ecriture comptable/EcrituresComptablesForm";
import EcritureComptablePreview from "./pages/Ecriture comptable/EcritureComptablePreview";
import Fournisseur from "./pages/Fournisseur/Fournisseurs";
import AboutPage from "./components/about/AboutPage";
import HomePage from "./components/Home/HomePage";
import GrandLivre from "./pages/GrandLivre/GrandLivre";
import Balance from "./pages/Balance/Balance";
import MultipleTabsBlocker from "./components/MultipleTabsBlocker";

const App = () => {
  const { user } = useSelector(state => state.auth);
  const [accessBlocked, setAccessBlocked] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel("BlockMultipleTabs");
    channel.postMessage("Tab Opened");

    channel.onmessage = (e) => {
      if (e.data === "Tab Opened") channel.postMessage("Block");
      else if (e.data === "Block") {
        channel.close();
        setAccessBlocked(true);
      }
    };

    return () => channel.close();
  }, []);

  if (accessBlocked) {
    return <MultipleTabsBlocker />;
  }

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signUp" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/facture" element={<Facture />} />
        <Route path="/clients" element={<Client />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/plan-comptable" element={<PlanComptable />} />
        <Route path="/ecritures-comptables" element={<EcritureComptable />} />
        <Route path="/ecritures-comptables/add" element={<EcrituresComptablesForm />} />
        <Route path="/ecritures-comptables/edit/:id" element={<EcrituresComptablesForm />} />
        <Route path="/ecritures-comptables/preview/:id" element={<EcritureComptablePreview />} />
        <Route path="/data-tables" element={<DataTables />} />
        <Route path="/update-facture/:id" element={<UpdateFactureForm />} />
        <Route path="/facture-form" element={<FactureForm />} />
        <Route path="/facture-lines" element={<FactureLines />} />
        <Route path="/Fournisseur" element={<Fournisseur />} />
        <Route path="/grand-livre" element={<GrandLivre />} />
        <Route path="/balance" element={<Balance />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;