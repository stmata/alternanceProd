import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AppContext);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
