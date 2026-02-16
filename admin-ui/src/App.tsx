import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import DoctorForm from './pages/DoctorForm';
import Consultations from './pages/Consultations';
import Products from './pages/Products';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Orders from './pages/Orders';
import SearchAnalytics from './pages/SearchAnalytics';
import ProductReviews from './pages/ProductReviews';
import ProductRoutines from './pages/ProductRoutines';
import DeliveryDashboard from './pages/DeliveryDashboard';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Placeholder from './pages/Placeholder';
import Warehouses from './pages/Warehouses';
import WarehouseForm from './pages/WarehouseForm';
import Suppliers from './pages/Suppliers';
import SupplierForm from './pages/SupplierForm';
import SupplierProducts from './pages/SupplierProducts';
import PurchaseOrders from './pages/PurchaseOrders';
import PurchaseOrderForm from './pages/PurchaseOrderForm';
import PurchaseOrderDetail from './pages/PurchaseOrderDetail';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import StockAlerts from './pages/StockAlerts';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#9B563A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomeRedirect />} />

        {/* Patients */}
        <Route path="patients" element={<Patients />} />
        <Route path="patients/records" element={<Placeholder title="Medical Records" description="View and manage patient medical records" />} />
        <Route path="patients/active" element={<Placeholder title="Active Cases" description="Monitor active patient cases" />} />
        <Route path="patients/reviews" element={<Placeholder title="Patient Reviews" description="View patient feedback and reviews" />} />

        {/* Doctors */}
        <Route path="doctors" element={<Doctors />} />
        <Route path="doctors/add" element={<DoctorForm />} />
        <Route path="doctors/edit/:id" element={<DoctorForm />} />

        {/* Consultations */}
        <Route path="consultations" element={<Consultations />} />
        <Route path="consultations/upcoming" element={<Placeholder title="Upcoming Consultations" description="View scheduled consultations" />} />
        <Route path="consultations/completed" element={<Placeholder title="Completed Consultations" description="View consultation history" />} />
        <Route path="consultations/prescriptions" element={<Placeholder title="Prescriptions" description="Manage patient prescriptions" />} />

        {/* E-Commerce */}
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<CategoryForm />} />
        <Route path="categories/:id/edit" element={<CategoryForm />} />
        <Route path="product-routines" element={<ProductRoutines />} />
        <Route path="orders" element={<Orders />} />
        <Route path="searches" element={<SearchAnalytics />} />
        <Route path="product-reviews" element={<ProductReviews />} />

        {/* Deliveries */}
        <Route path="deliveries" element={<DeliveryDashboard />} />

        {/* Warehouse Management */}
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="warehouses/add" element={<WarehouseForm />} />
        <Route path="warehouses/edit/:id" element={<WarehouseForm />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/add" element={<SupplierForm />} />
        <Route path="suppliers/edit/:id" element={<SupplierForm />} />
        <Route path="suppliers/:id/products" element={<SupplierProducts />} />
        <Route path="purchase-orders" element={<PurchaseOrders />} />
        <Route path="purchase-orders/create" element={<PurchaseOrderForm />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/movements" element={<StockMovements />} />
        <Route path="inventory/alerts" element={<StockAlerts />} />

        {/* Financials */}
        <Route path="financials/transactions" element={<Placeholder title="Transactions" description="View all financial transactions" />} />
        <Route path="financials/revenue" element={<Placeholder title="Revenue Analytics" description="Track revenue and financial performance" />} />
        <Route path="financials/refunds" element={<Placeholder title="Refunds & Disputes" description="Handle refunds and payment disputes" />} />
        <Route path="financials/reports" element={<Placeholder title="Financial Reports" description="Generate financial reports and statements" />} />

        {/* Content */}
        <Route path="content/cms" element={<Placeholder title="Content Management" description="Manage website content and pages" />} />
        <Route path="content/blog" element={<Placeholder title="Blog Posts" description="Create and manage blog posts" />} />
        <Route path="content/faqs" element={<Placeholder title="FAQs" description="Manage frequently asked questions" />} />
        <Route path="content/testimonials" element={<Placeholder title="Testimonials" description="Manage patient testimonials" />} />

        {/* Communications */}
        <Route path="communications/messages" element={<Placeholder title="Messages" description="View and respond to messages" />} />
        <Route path="communications/notifications" element={<Placeholder title="Notifications" description="Manage system notifications" />} />
        <Route path="communications/templates" element={<Placeholder title="Email Templates" description="Create and edit email templates" />} />

        {/* Analytics */}
        <Route path="analytics/dashboard" element={<Placeholder title="Dashboard Analytics" description="View platform analytics and metrics" />} />
        <Route path="analytics/reports" element={<Placeholder title="Analytics Reports" description="Generate detailed analytics reports" />} />
        <Route path="analytics/export" element={<Placeholder title="Export Data" description="Export analytics and report data" />} />

        {/* Settings */}
        <Route path="settings/general" element={<Settings />} />
        <Route path="settings/security" element={<Placeholder title="Security Settings" description="Manage security and authentication settings" />} />
        <Route path="settings/integrations" element={<Placeholder title="Integrations" description="Configure third-party integrations" />} />
        <Route path="settings/admin-users" element={<Placeholder title="Admin Users" description="Manage admin users and permissions" />} />

        {/* Support */}
        <Route path="support" element={<Support />} />
      </Route>

      {/* Catch all - redirect to login if not authenticated, otherwise home */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
