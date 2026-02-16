import { Navigate, Outlet } from 'react-router-dom';
import { tokenManager } from '../api/client';

export const ProtectedRoute = () => {
    const isAuthenticated = tokenManager.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
