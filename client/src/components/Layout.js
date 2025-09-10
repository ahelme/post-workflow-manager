import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Icons removed for clean minimal design

const Layout = ({ children }) => {
  const { user, logout, isAdmin, isProducer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [statusExpanded, setStatusExpanded] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'Students', href: '/students' },
    ...(isProducer ? [{ name: 'Backup', href: '/backup' }] : []),
  ];

  const statusOptions = [
    { value: 'development', label: 'Development' },
    { value: 'pre-production', label: 'Pre-Production' },
    { value: 'shooting', label: 'Shooting' },
    { value: 'post-production', label: 'Post-Production' },
    { value: 'grading', label: 'Grading' },
    { value: 'audio-mix', label: 'Audio Mix' },
    { value: 'complete', label: 'Complete' },
  ];

  const adminNavigation = isAdmin ? [{ name: 'Settings', href: '/settings' }] : [];

  const isCurrentPath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isStatusPath = () => {
    return location.pathname.startsWith('/projects?status=');
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
                <span className="text-white text-xl">×</span>
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-bold text-gray-900">
                  PostFlow
                </span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isCurrentPath(item.href)
                          ? 'bg-secondary-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                
                {/* Status Section */}
                <div className="space-y-1">
                  <button
                    onClick={() => setStatusExpanded(!statusExpanded)}
                    className={`group flex items-center justify-between w-full px-2 py-2 text-base font-medium rounded-md ${
                      isStatusPath()
                        ? 'bg-secondary-200 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>Status</span>
                    <span className={`transform transition-transform duration-200 ${
                      statusExpanded ? 'rotate-90' : ''
                    }`}>
                      >
                    </span>
                  </button>
                  {statusExpanded && (
                    <div className="pl-4 space-y-1">
                      {statusOptions.map((status) => (
                        <Link
                          key={status.value}
                          to={`/projects?status=${status.value}`}
                          className="group flex items-center px-2 py-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => setSidebarOpen(false)}
                        >
                          {status.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Navigation */}
                {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isCurrentPath(item.href)
                          ? 'bg-secondary-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-48 lg:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-gray-900">
              PostFlow
            </span>
          </div>
          <nav className="mt-5 flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCurrentPath(item.href)
                      ? 'bg-secondary-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            
            {/* Status Section */}
            <div className="space-y-1">
              <button
                onClick={() => setStatusExpanded(!statusExpanded)}
                className={`group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md ${
                  isStatusPath()
                    ? 'bg-secondary-200 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span>Status</span>
                <span className={`transform transition-transform duration-200 text-xs ${
                  statusExpanded ? 'rotate-90' : ''
                }`}>
                  >
                </span>
              </button>
              {statusExpanded && (
                <div className="pl-4 space-y-1">
                  {statusOptions.map((status) => (
                    <Link
                      key={status.value}
                      to={`/projects?status=${status.value}`}
                      className="group flex items-center px-2 py-1 text-xs font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      {status.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Navigation */}
            {adminNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isCurrentPath(item.href)
                      ? 'bg-secondary-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-xs font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-2 py-1 text-xs bg-secondary-200 text-gray-700 rounded hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-48 flex flex-col flex-1">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <div className="h-6 w-6 flex flex-col justify-center space-y-1">
              <span className="block w-5 h-0.5 bg-current"></span>
              <span className="block w-5 h-0.5 bg-current"></span>
              <span className="block w-5 h-0.5 bg-current"></span>
            </div>
          </button>
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                PostFlow
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <span className="ml-2 text-xs font-medium text-gray-700">
                  {user?.firstName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-2 py-1 text-xs bg-secondary-200 text-gray-700 rounded hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Logout
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