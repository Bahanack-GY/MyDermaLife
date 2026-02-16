import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../pages/Dashboard';

export default function HomeRedirect() {
  const { user } = useAuth();

  // Redirect users based on their role
  switch (user?.role) {
    case 'delivery':
      // Delivery personnel go to their deliveries dashboard
      return <Navigate to="/deliveries" replace />;

    case 'catalog_manager':
      // Catalog managers go directly to products
      return <Navigate to="/products" replace />;

    case 'doctor':
    case 'super_admin':
    case 'admin':
    default:
      // Doctors, admins, and other roles see the main dashboard
      return <Dashboard />;
  }
}
