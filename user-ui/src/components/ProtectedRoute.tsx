import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenManager } from '../api/client';

interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const location = useLocation();
    const isAuthenticated = tokenManager.isAuthenticated();

    if (!isAuthenticated) {
        // Redirect to login page, but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
