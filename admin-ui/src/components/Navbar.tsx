import { Layout, Button, Avatar, Dropdown, theme, Badge } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useAuth';

const { Header } = Layout;

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Navbar({ collapsed, setCollapsed }: NavbarProps) {
  const { user } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'A';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="px-1 py-1">
          <p className="font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
          <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
        </div>
      ),
      disabled: true,
      className: 'cursor-default',
    },
    {
      type: 'divider',
    },
    {
      key: '3',
      danger: true,
      icon: <LogoutOutlined />,
      label: isLoggingOut ? 'Logging out...' : 'Log Out',
      onClick: () => logout(),
    },
  ];

  return (
    <Header
      style={{
        padding: 0,
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '16px',
          width: 64,
          height: 64,
        }}
      />

      <div className="flex items-center gap-4">
        <Badge count={5} size="small" offset={[-2, 2]}>
          <Button type="text" shape="circle" icon={<BellOutlined className="text-lg text-gray-600" />} />
        </Badge>

        <Button type="text" shape="circle" icon={<SettingOutlined className="text-lg text-gray-600" />} />

        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors ml-2">
            <Avatar
              style={{ backgroundColor: '#9B563A', verticalAlign: 'middle' }}
              size="large"
            >
              {getUserInitials()}
            </Avatar>
            <div className="hidden md:block leading-tight text-right mr-2">
              <div className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
