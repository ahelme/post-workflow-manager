import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
// Icons removed for clean minimal design

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  // Redirect if user is not admin
  if (!isAdmin) {
    return (
      <div className="py-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-6xl text-red-500 mb-4 block">!</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500 mb-4">
              You need administrator permissions to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      
      // First, export SQL backup
      toast.success('Creating backup before reset...');
      
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Backup creation failed');
      }
      
      const backupResult = await response.json();
      console.log('Backup created:', backupResult.filename);
      
      toast.success('Backup created successfully');
      
      // Show first confirmation dialog
      setShowFirstConfirm(true);
      
    } catch (error) {
      console.error('Backup creation failed:', error);
      toast.error('Failed to create backup. Reset cancelled.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleFirstConfirm = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(true);
  };

  const handleFinalReset = async () => {
    try {
      setIsResetting(true);
      
      toast.loading('Resetting database...');
      
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Database reset failed');
      }
      
      const result = await response.json();
      console.log('Database reset:', result.message);
      
      toast.success('Database has been reset successfully');
      setShowSecondConfirm(false);
      
      // Optionally refresh the page to show empty state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Database reset failed:', error);
      toast.error('Failed to reset database');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCancel = () => {
    setShowFirstConfirm(false);
    setShowSecondConfirm(false);
  };

  return (
    <div className="py-1">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-lg font-bold leading-7 text-gray-900">
            Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            System administration and maintenance tools
          </p>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">
                System Information
              </h3>
            </div>
            <div className="card-body">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current User</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user?.firstName} {user?.lastName} ({user?.role})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Environment</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {process.env.NODE_ENV || 'development'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Dangerous Actions */}
        <div className="card border-red-200">
          <div className="card-header bg-red-50">
            <h3 className="text-lg font-medium text-red-900">
              Dangerous Actions
            </h3>
            <p className="text-sm text-red-600">
              These actions are irreversible and will affect the entire system
            </p>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-900">Reset Database</h4>
                  <p className="text-sm text-red-600">
                    This will delete all data and reset the database to its initial state. 
                    A backup will be created automatically before the reset.
                  </p>
                </div>
                <button
                  onClick={handleResetDatabase}
                  disabled={isResetting}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  {isResetting ? 'Processing...' : 'Reset Database'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* First Confirmation Dialog */}
        {showFirstConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Reset Database
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Do you really want to reset the database? A backup has been created.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleFirstConfirm}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Second Confirmation Dialog */}
        {showSecondConfirm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

              <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <span className="text-red-600 text-xl">🚨</span>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Final Confirmation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to reset the database? This cannot be undone. 
                        You can re-import a backup however.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleFinalReset}
                    disabled={isResetting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset Database'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isResetting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;