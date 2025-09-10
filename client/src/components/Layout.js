import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Film,
  Users,
  Settings,
  LogOut,
  User,
  Archive,
  Menu,
  X,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isProducer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Projects', href: '/projects', icon: Film },
    { name: 'Students', href: '/students', icon: Users },
    ...(isProducer ? [{ name: 'Backup', href: '/backup', icon: Archive }] : []),
    ...(isAdmin ? [{ name: 'Settings', href: '/settings', icon: Settings }] : []),
  ];

  const isCurrentPath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-full h-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 p-2 -mr-12">
              <button
                className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Film className="w-8 h-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Film Production
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isCurrentPath(item.href)
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="mr-4 flex-shrink-0 h-6 w-6" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs font-medium text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <Film className="w-8 h-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Film Production
            </span>
          </div>
          <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCurrentPath(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Film Production Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user?.firstName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;