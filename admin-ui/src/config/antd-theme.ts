import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#9B563A',
    colorLink: '#9B563A',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#9B563A',
    colorTextBase: '#4a403a',
    colorBgBase: '#ffffff',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    borderRadius: 8,
  },
  components: {
    Button: {
      primaryShadow: 'none',
      colorPrimary: '#9B563A',
      colorPrimaryHover: '#7A4429',
      colorPrimaryActive: '#7A4429',
      borderRadius: 8,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#4a403a',
      borderColor: '#e5e5e5',
      rowHoverBg: '#fafafa',
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },
  },
};
