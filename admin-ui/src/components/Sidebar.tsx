import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  MdDashboard,
  MdPeople,
  MdLocalHospital,
  MdEventNote,
  MdShoppingCart,
  MdAttachMoney,
  MdArticle,
  MdMessage,
  MdBarChart,
  MdSettings,
  MdHelpOutline,
  MdWarehouse,
  MdLocalShipping,
} from 'react-icons/md';
import { useAuth } from '../contexts/AuthContext';
import lisLogo from '../assets/lis-logo.webp';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const getMenuItems = (userRole?: string): MenuItem[] => {
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';
  const isDelivery = userRole === 'delivery';
  const isDoctor = userRole === 'doctor';
  const isCatalogManager = userRole === 'catalog_manager';

  // Catalog Manager - Only product management
  if (isCatalogManager) {
    return [
      getItem('Products', 'sub1', <MdShoppingCart className="text-xl" />, [
        getItem('All Products', '/products'),
        getItem('Add Product', '/products/add'),
        getItem('Categories', '/categories'),
        getItem('Product Routines', '/product-routines'),
      ]),
      getItem('Support', '/support', <MdHelpOutline className="text-xl" />),
    ];
  }

  // Doctor - Consultations and patient management
  if (isDoctor) {
    return [
      getItem('Dashboard', '/', <MdDashboard className="text-xl" />),

      getItem('Patients', 'sub1', <MdPeople className="text-xl" />, [
        getItem('All Patients', '/patients'),
        getItem('Medical Records', '/patients/records'),
        getItem('Active Cases', '/patients/active'),
      ]),

      getItem('Consultations', 'sub2', <MdEventNote className="text-xl" />, [
        getItem('All Consultations', '/consultations'),
        getItem('Upcoming', '/consultations/upcoming'),
        getItem('Completed', '/consultations/completed'),
        getItem('Prescriptions', '/consultations/prescriptions'),
      ]),

      getItem('Support', '/support', <MdHelpOutline className="text-xl" />),
    ];
  }

  // Delivery personnel - Only delivery operations
  if (isDelivery) {
    return [
      getItem('My Deliveries', '/deliveries', <MdLocalShipping className="text-xl" />),
      getItem('Support', '/support', <MdHelpOutline className="text-xl" />),
    ];
  }

  // Super Admin - Full access to everything
  if (isAdmin) {
    return [
      getItem('Dashboard', '/', <MdDashboard className="text-xl" />),

      getItem('Patients', 'sub1', <MdPeople className="text-xl" />, [
        getItem('All Patients', '/patients'),
        getItem('Medical Records', '/patients/records'),
        getItem('Active Cases', '/patients/active'),
        getItem('Reviews', '/patients/reviews'),
      ]),

      getItem('Doctors', 'sub2', <MdLocalHospital className="text-xl" />, [
        getItem('All Doctors', '/doctors'),
        getItem('Add Doctor', '/doctors/add'),
      ]),

      getItem('Consultations', 'sub3', <MdEventNote className="text-xl" />, [
        getItem('All Consultations', '/consultations'),
        getItem('Upcoming', '/consultations/upcoming'),
        getItem('Completed', '/consultations/completed'),
        getItem('Prescriptions', '/consultations/prescriptions'),
      ]),

      getItem('E-Commerce', 'sub4', <MdShoppingCart className="text-xl" />, [
        getItem('Products', '/products'),
        getItem('Categories', '/categories'),
        getItem('Product Routines', '/product-routines'),
        getItem('Orders', '/orders'),
        getItem('Searches', '/searches'),
        getItem('Reviews', '/product-reviews'),
      ]),

      getItem('Deliveries', '/deliveries', <MdLocalShipping className="text-xl" />),

      getItem('Warehouse', 'sub5', <MdWarehouse className="text-xl" />, [
        getItem('Warehouses', '/warehouses'),
        getItem('Suppliers', '/suppliers'),
        getItem('Purchase Orders', '/purchase-orders'),
        getItem('Inventory', '/inventory'),
        getItem('Stock Movements', '/inventory/movements'),
        getItem('Stock Alerts', '/inventory/alerts'),
      ]),

      getItem('Financials', 'sub6', <MdAttachMoney className="text-xl" />, [
        getItem('Transactions', '/financials/transactions'),
        getItem('Revenue', '/financials/revenue'),
        getItem('Refunds', '/financials/refunds'),
        getItem('Reports', '/financials/reports'),
      ]),

      getItem('Content', 'sub7', <MdArticle className="text-xl" />, [
        getItem('CMS', '/content/cms'),
        getItem('Blog', '/content/blog'),
        getItem('FAQs', '/content/faqs'),
        getItem('Testimonials', '/content/testimonials'),
      ]),

      getItem('Communications', 'sub8', <MdMessage className="text-xl" />, [
        getItem('Messages', '/communications/messages'),
        getItem('Notifications', '/communications/notifications'),
        getItem('Templates', '/communications/templates'),
      ]),

      getItem('Analytics', 'sub9', <MdBarChart className="text-xl" />, [
        getItem('Dashboard Analytics', '/analytics/dashboard'),
        getItem('Reports', '/analytics/reports'),
        getItem('Export', '/analytics/export'),
      ]),

      getItem('Settings', 'sub10', <MdSettings className="text-xl" />, [
        getItem('General', '/settings/general'),
        getItem('Security', '/settings/security'),
        getItem('Integrations', '/settings/integrations'),
        getItem('Admin Users', '/settings/admin-users'),
      ]),

      getItem('Support', '/support', <MdHelpOutline className="text-xl" />),
    ];
  }

  // Default fallback (should not happen)
  return [getItem('Dashboard', '/', <MdDashboard className="text-xl" />)];
};

export default function Sidebar({ collapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const items = getMenuItems(user?.role);

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  // Determine selected and open keys based on current path
  const getSelectedKeys = () => [location.pathname];

  // Create a primitive way to determine open keys based on the structure
  // This is a simplification; for a robust solution, you'd map paths to parent keys
  const getOpenKeys = () => {
    const path = location.pathname;
    const userRole = user?.role;

    // For catalog manager, products/categories are in sub1
    if (userRole === 'catalog_manager') {
      if (path.startsWith('/products') || path.startsWith('/categories') || path.startsWith('/product-routines')) return ['sub1'];
      return [];
    }

    // For doctor, patients are sub1, consultations are sub2
    if (userRole === 'doctor') {
      if (path.startsWith('/patients')) return ['sub1'];
      if (path.startsWith('/consultations')) return ['sub2'];
      return [];
    }

    // For admin, use the full menu structure
    if (path.startsWith('/patients')) return ['sub1'];
    if (path.startsWith('/doctors')) return ['sub2'];
    if (path.startsWith('/consultations')) return ['sub3'];
    if (path.startsWith('/products') || path.startsWith('/categories') || path.startsWith('/product-routines') || path.startsWith('/orders') || path.startsWith('/searches') || path.startsWith('/product-reviews')) return ['sub4'];
    if (path.startsWith('/deliveries')) return [];
    if (path.startsWith('/warehouses') || path.startsWith('/suppliers') || path.startsWith('/purchase-orders') || path.startsWith('/inventory')) return ['sub5'];
    if (path.startsWith('/financials')) return ['sub6'];
    if (path.startsWith('/content')) return ['sub7'];
    if (path.startsWith('/communications')) return ['sub8'];
    if (path.startsWith('/analytics')) return ['sub9'];
    if (path.startsWith('/settings')) return ['sub10'];
    return [];
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={260}
      theme="light"
      className="border-r border-gray-100 shadow-sm"
      style={{
        background: colorBgContainer,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-100 mb-2">
        {user?.role === 'delivery' ? (
          // Delivery agent: Show both logos
          !collapsed ? (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif font-bold text-[#9B563A]">
                MyDermaLife
              </h1>
              <div className="h-8 w-px bg-gray-300"></div>
              <img
                src={lisLogo}
                alt="LIS"
                className="h-10 w-10 object-contain"
              />
            </div>
          ) : (
            <img
              src={lisLogo}
              alt="LIS"
              className="h-8 w-8 object-contain"
            />
          )
        ) : (
          // Other roles: Show only MyDermaLife logo
          !collapsed ? (
            <h1 className="text-2xl font-serif font-bold text-[#9B563A]">
              MyDermaLife
            </h1>
          ) : (
            <h1 className="text-xl font-serif font-bold text-[#9B563A]">
              MDL
            </h1>
          )
        )}
      </div>

      <Menu
        onClick={onClick}
        theme="light"
        mode="inline"
        defaultSelectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        selectedKeys={getSelectedKeys()}
        items={items}
        style={{ borderRight: 0 }}
        className="font-medium text-gray-600"
      />
    </Sider>
  );
}
