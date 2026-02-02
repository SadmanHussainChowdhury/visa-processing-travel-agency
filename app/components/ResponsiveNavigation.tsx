'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from '../hooks/useTranslations';

interface ResponsiveNavigationProps {
  navigation: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href: string;
    hasSubmenu?: boolean;
  }[];
  systemTitle?: string;
  systemDescription?: string;
}

export default function ResponsiveNavigation({
  navigation,
  systemTitle = 'Agency Management System',
  systemDescription = 'Professional Business Management'
}: ResponsiveNavigationProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
  const [activeSubmenus, setActiveSubmenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslations();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(event.target as Node)) {
        setMobileProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleSubmenu = (menuId: string) => {
    setActiveSubmenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
    // Close sidebar on mobile after submenu click
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleNavigationClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:w-72
        lg:translate-x-0 lg:static lg:inset-0 lg:w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 sm:px-6">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-gray-900 truncate sm:text-xl">
                {systemTitle}
              </h1>
              <p className="text-xs text-gray-700 truncate hidden sm:block">
                {systemDescription}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 touch-target"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="px-2 py-4 space-y-1 sm:px-3">
          {navigation.map((item) => (
            <div key={item.id}>
              {item.hasSubmenu ? (
                <>
                  <button
                    className={`
                      flex items-center justify-between w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors
                      sm:space-x-3 sm:px-3 sm:py-2
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                      touch-target
                    `}
                    onClick={() => toggleSubmenu(item.id)}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform flex-shrink-0 ${
                        activeSubmenus[item.id] ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  {activeSubmenus[item.id] && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2 py-1 sm:ml-6">
                      {/* Add submenu items here based on item.id */}
                      <div className="text-xs text-gray-500 px-2 py-1">
                        Submenu items would go here
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors
                    sm:space-x-3 sm:px-3 sm:py-2
                    ${isActiveRoute(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                    touch-target
                  `}
                  onClick={handleNavigationClick}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="px-2 py-4 border-t border-gray-200 sm:px-3">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors touch-target"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || t('auth.user')}
                </p>
                <p className="text-xs text-gray-700 truncate">
                  {session?.user?.role || t('auth.user')}
                </p>
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                  profileMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigationClick();
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span>{t('profile.profileSettings')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleNavigationClick();
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors touch-target"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('profile.logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header - Mobile Only */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 touch-target"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 touch-target">
                <Bell className="h-5 w-5" />
              </button>
              
              <LanguageSwitcher />
              
              <div className="relative" ref={mobileProfileMenuRef}>
                <button
                  onClick={() => setMobileProfileMenuOpen(!mobileProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600 touch-target"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Profile Dropdown Menu */}
                {mobileProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {session?.user?.name || t('auth.user')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session?.user?.email || 'user@example.com'}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors touch-target"
                        onClick={() => setMobileProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>{t('profile.profileSettings')}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileProfileMenuOpen(false);
                          signOut({ callbackUrl: '/login' });
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors touch-target"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('profile.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Content will be passed as children */}
        </main>
      </div>
    </div>
  );
}