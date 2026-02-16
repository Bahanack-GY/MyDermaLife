import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
        <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <Header />
        
        <main className={cn(
            "p-6 pt-20 min-h-screen transition-all duration-300 ease-in-out",
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}>
            <div className="max-w-7xl mx-auto animate-fade-in">
                <Outlet />
            </div>
        </main>
    </div>
  );
}
