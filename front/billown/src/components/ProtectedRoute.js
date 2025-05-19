import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

const ProtectedRoute = () => {
  const isAuth = authService.isAuthenticated();
  
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;