'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from '../hooks/useTranslations';
import { useSettings } from '../contexts/SettingsContext';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  Users, 
  Calendar, 
  FileText, 
  Home,
  Stethoscope,
  Plus,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Brain,
  TrendingUp,
  Pill,
  Camera,
  Shield,
  LineChart,
  Mic,
  User,
  ChevronDown,
  FolderOpen,
  Upload,
  Search,
  Filter,
  AlertTriangle,
  DollarSign,
  Calculator,
  BarChart3,
  FileBarChart,
  Fingerprint,
  CheckCircle,
  AlertCircle,
  Target,
  Send,
  BookOpen
} from 'lucide-react';

interface SidebarLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function SidebarLayout({ children, title, description }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileProfileMenuOpen, setMobileProfileMenuOpen] = useState(false);
  const [isNotificationsSubmenuOpen, setIsNotificationsSubmenuOpen] = useState(false);
  const [isClientsSubmenuOpen, setIsClientsSubmenuOpen] = useState(false);
  const [isReportsSubmenuOpen, setIsReportsSubmenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, translationsLoaded } = useTranslations();
  const { settings } = useSettings();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);

              const navigation = [
              { id: 'dashboard', label: t('navigation.dashboard'), icon: Home, href: '/' },
              { id: 'clients', label: 'Client Management', icon: Users, href: '/clients', hasSubmenu: true },
              { id: 'appointments', label: t('Appointments  '), icon: Calendar, href: '/appointments' },
              { id: 'visa-cases', label: 'Visa Cases', icon: FileText, href: '/visa-cases' },
              { id: 'accounting', label: 'Accounting & Finance', icon: DollarSign, href: '/accounting' },
              { id: 'documents', label: 'Document Handling', icon: FolderOpen, href: '/documents' },
              { id: 'notifications', label: 'Communication', icon: Bell, href: '/notifications', hasSubmenu: true },
              { id: 'smart-case-intelligence', label: t('navigation.smartCaseIntelligence'), icon: Target, href: '/smart-case-intelligence' },
              { id: 'crm', label: 'CRM & Lead Management', icon: Users, href: '/crm' },
              { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports', hasSubmenu: true },
              { id: 'case-control', label: 'Case Control & Quality Assurance', icon: Shield, href: '/case-control' },
              { id: 'compliance', label: 'Compliance & Security', icon: Shield, href: '/compliance' },
              { id: 'knowledge-help', label: 'Knowledge & Help System', icon: BookOpen, href: '/knowledge-help' },
              { id: 'verification-compliance', label: 'Verification & Compliance', icon: CheckCircle, href: '/verification-compliance' }
            ];

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  // Close profile menus when clicking outside
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

  // Show loading state if translations aren't loaded yet
  if (!translationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading translations...</p>
          </div>
        </div>
      </div>
    );
  }

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
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {settings?.systemTitle || 'Visa Processing Travel Agency'}
              </h1>
              <p className="text-xs text-gray-700">
                {settings?.systemDescription || 'Visa Processing & Management System'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>


        {/* Navigation Menu */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            if (item.id === 'notifications' && item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => {
                      setIsNotificationsSubmenuOpen(!isNotificationsSubmenuOpen);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isNotificationsSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isNotificationsSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2 py-1">
                      <Link
                        href="/notifications/new"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/notifications/new')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Send className="h-4 w-4" />
                        <span>New Notification</span>
                      </Link>
                      <Link
                        href="/notifications/templates"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/notifications/templates')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Message Templates</span>
                      </Link>
                      <Link
                        href="/forms"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/forms')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Form Library & Templates</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            } else if (item.id === 'clients' && item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => {
                      setIsClientsSubmenuOpen(!isClientsSubmenuOpen);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isClientsSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isClientsSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2 py-1">
                      <Link
                        href="/clients"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/clients')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Clients</span>
                      </Link>
                      <Link
                        href="/clients/new"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/clients/new')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New Client</span>
                      </Link>
                      <Link
                        href="/export-import"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/export-import')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Upload className="h-4 w-4" />
                        <span>Export & Import</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            } else if (item.id === 'reports' && item.hasSubmenu) {
              return (
                <div key={item.id}>
                  <button
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-colors
                      ${isActiveRoute(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={() => {
                      setIsReportsSubmenuOpen(!isReportsSubmenuOpen);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${isReportsSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isReportsSubmenuOpen && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2 py-1">
                      <Link
                        href="/reports"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/reports')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <LineChart className="h-4 w-4" />
                        <span>Analytics</span>
                      </Link>
                      <Link
                        href="/workflow-tracking"
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActiveRoute('/workflow-tracking')
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <FileBarChart className="h-4 w-4" />
                        <span>Workflow & Tracking</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            } else {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActiveRoute(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            }
          })}
        </nav>

        {/* General Settings */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="space-y-1">
            <Link
              href="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="h-4 w-4 text-gray-600" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 px-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <Link
              href="/clients/new"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>New Client</span>
            </Link>
            <Link
              href="/appointments/new"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="h-4 w-4 text-green-600" />
              <span>New Appointment</span>
            </Link>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3">
            <LanguageSwitcher />
          </div>
        </div>

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {session?.user?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || t('auth.doctor')}
                </p>
                <p className="text-xs text-gray-700">{session?.user?.role || t('auth.doctor')}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>{t('profile.profileSettings')}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
              </button>
              <LanguageSwitcher />
              <div className="relative" ref={mobileProfileMenuRef}>
                <button
                  onClick={() => setMobileProfileMenuOpen(!mobileProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {session?.user?.name?.charAt(0) || 'D'}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Profile Dropdown Menu */}
                {mobileProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{session?.user?.name || t('auth.doctor')}</p>
                        <p className="text-xs text-gray-600">{session?.user?.email || 'doctor@aidoc.com'}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
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
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                                        <p className="text-gray-700">{description}</p>
              )}
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
