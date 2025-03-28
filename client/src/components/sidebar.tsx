import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BarChart3, Home, Settings, HelpCircle, LogOut, Menu, X, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { SettingsButton } from "@/components/settings-button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Reset collapsed state when on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    
    // Check if username exists and is a string before using substring
    if (user.username && typeof user.username === 'string') {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return "U"; // Fallback if no valid username
  };

  const links = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/tables", label: "My Tables", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/help-support", label: "Help & Support", icon: HelpCircle },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          className
        )}
      >
        <div className={cn(
          "p-4 border-b flex items-center gap-2 transition-all duration-300",
          collapsed ? "justify-center" : ""
        )}>
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          {!collapsed && (
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              DataSync
            </h1>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-gray-600 transition-transform duration-300 ease-in-out"
          >
            <ChevronRight className={cn(
              "h-5 w-5 transform",
              collapsed ? "rotate-180" : ""
            )} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.href);
                }}
                className={cn(
                  "flex items-center text-sm rounded-lg transition-all duration-200 overflow-hidden",
                  isActive 
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-50",
                  collapsed ? "justify-center py-3 px-0" : "px-4 py-3"
                )}
                title={collapsed ? link.label : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600" 
                    : "text-gray-500",
                  "w-8 h-8 rounded-md"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                {!collapsed && <span className="ml-3">{link.label}</span>}
              </a>
            );
          })}
        </nav>
        
        <div className={cn(
          "p-4 border-t",
          collapsed ? "flex justify-center" : ""
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "flex-col gap-2" : ""
          )}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {getUserInitials()}
            </div>
            {!collapsed && (
              <>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <SettingsButton />
                  <button 
                    className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={handleLogout}
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
            {collapsed && (
              <>
                <SettingsButton />
                <button 
                  className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button 
            className="text-gray-600 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
              DataSync
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsButton />
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-200",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                DataSync
              </h1>
            </div>
            <button 
              className="text-gray-600 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors" 
              onClick={toggleMobileMenu}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="py-6 px-3 space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex items-center text-sm rounded-lg transition-all duration-200 px-4 py-3",
                    isActive 
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-md",
                    isActive 
                      ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600" 
                      : "text-gray-500"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="ml-3">{link.label}</span>
                </a>
              );
            })}
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                {getUserInitials()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <SettingsButton />
                <button 
                  className="text-slate-500 hover:text-slate-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
