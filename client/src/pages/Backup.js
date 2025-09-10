import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { backupAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Database,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Trash2,
  Play,
  FileDown,
} from 'lucide-react';

const Backup = () => {
  const { isAdmin, isProducer } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch backup history
  const { data: backups, isLoading } = useQuery(
    'backups',
    () => backupAPI.getHistory().then(res => res.data),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchOnWindowFocus: false,
    }
  );

  // Create backup mutation
  const createBackupMutation = useMutation(
    ({ format, type }) => backupAPI.create({ format, type }),
    {
      onSuccess: () => {
        toast.success('Backup created successfully!');
        queryClient.invalidateQueries('backups');
        setIsCreating(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create backup');
        setIsCreating(false);
      },
    }
  );

  // Delete backup mutation
  const deleteBackupMutation = useMutation(
    (filename) => backupAPI.delete(filename),
    {
      onSuccess: () => {
        toast.success('Backup deleted successfully!');
        queryClient.invalidateQueries('backups');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete backup');
      },
    }
  );

  const handleCreateBackup = async () => {
    if (!isAdmin && !isProducer) {
      toast.error('You do not have permission to create backups');
      return;
    }

    setIsCreating(true);
    createBackupMutation.mutate({
      format: selectedFormat,
      type: 'manual',
    });
  };

  const handleDownload = async (filename) => {
    try {
      const response = await backupAPI.download(filename);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Backup downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download backup');
    }
  };

  const handleDelete = (filename) => {
    if (window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      deleteBackupMutation.mutate(filename);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading backup information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Backup Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, manage, and download database backups
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Backup */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Create New Backup
                </h3>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="format" className="block text-sm font-medium text-gray-700">
                      Format
                    </label>
                    <select
                      id="format"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="mt-1 form-select"
                      disabled={!isAdmin && !isProducer}
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="sql">SQL</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateBackup}
                      disabled={isCreating || (!isAdmin && !isProducer)}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Play className="w-4 h-4 mr-2" />
                          Create Backup
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                {!isAdmin && !isProducer && (
                  <p className="mt-2 text-sm text-gray-500 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    You need admin or producer permissions to create backups.
                  </p>
                )}
              </div>
            </div>

            {/* Backup History */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Backup History
                </h3>
              </div>
              <div className="card-body p-0">
                {backups && backups.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Filename</th>
                          <th>Type</th>
                          <th>Format</th>
                          <th>Size</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backups.map((backup) => (
                          <tr key={backup.id} className="hover:bg-gray-50">
                            <td>
                              <div className="flex items-center">
                                {getStatusIcon(backup.status)}
                                <span className="ml-2">
                                  {getStatusBadge(backup.status)}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="text-sm font-medium text-gray-900">
                                {backup.filename}
                              </div>
                              {backup.errorMessage && (
                                <div className="text-xs text-red-600 mt-1">
                                  {backup.errorMessage}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="capitalize text-sm text-gray-900">
                                {backup.type}
                              </span>
                            </td>
                            <td>
                              <span className="uppercase text-sm text-gray-900 font-mono">
                                {backup.format}
                              </span>
                            </td>
                            <td className="text-sm text-gray-900">
                              {formatFileSize(backup.size)}
                            </td>
                            <td className="text-sm text-gray-900">
                              {new Date(backup.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <div className="flex items-center space-x-2">
                                {backup.status === 'completed' && (
                                  <button
                                    onClick={() => handleDownload(backup.filename)}
                                    className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                                    title="Download"
                                  >
                                    <FileDown className="w-4 h-4" />
                                  </button>
                                )}
                                {(isAdmin || isProducer) && (
                                  <button
                                    onClick={() => handleDelete(backup.filename)}
                                    className="p-2 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first backup to get started
                    </p>
                    {(isAdmin || isProducer) && (
                      <button
                        onClick={handleCreateBackup}
                        className="btn-primary"
                        disabled={isCreating}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Create First Backup
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Backup Statistics */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
              </div>
              <div className="card-body">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Backups</dt>
                    <dd className="mt-1 text-2xl font-bold text-gray-900">
                      {backups?.length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Successful</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-600">
                      {backups?.filter(b => b.status === 'completed').length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Failed</dt>
                    <dd className="mt-1 text-2xl font-bold text-red-600">
                      {backups?.filter(b => b.status === 'failed').length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Size</dt>
                    <dd className="mt-1 text-lg font-bold text-gray-900">
                      {formatFileSize(backups?.reduce((sum, b) => sum + (b.size || 0), 0))}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Backup Schedule Info */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule
                </h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Daily Backup</span>
                    <span className="text-sm font-medium text-green-600">Active (2:00 AM)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cleanup</span>
                    <span className="text-sm font-medium text-green-600">Weekly (Saturdays)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention</span>
                    <span className="text-sm font-medium text-gray-900">30 days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  onClick={() => queryClient.invalidateQueries('backups')}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh List
                </button>
                {(isAdmin || isProducer) && (
                  <button
                    onClick={() => handleCreateBackup()}
                    disabled={isCreating}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Quick Backup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backup;