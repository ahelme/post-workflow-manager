import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Film,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState([]);

  // Fetch project statistics
  const { data: stats, isLoading: statsLoading } = useQuery(
    'projectStats',
    () => projectsAPI.getStats().then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch recent projects
  const { isLoading: projectsLoading } = useQuery(
    'recentProjects',
    () => projectsAPI.getAll({ limit: 5, sortBy: 'updated_at' }).then(res => res.data),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setRecentProjects(data.projects || []);
      },
    }
  );

  // Fetch students count
  const { data: studentsData } = useQuery(
    'studentsCount',
    () => studentsAPI.getAll({ limit: 1 }).then(res => res.data),
    {
      refetchOnWindowFocus: false,
    }
  );

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pre-production': 'badge-pre-production',
      'shooting': 'badge-shooting',
      'post-production': 'badge-post-production',
      'grading': 'badge-grading',
      'audio-mix': 'badge-audio-mix',
      'complete': 'badge-complete',
    };
    return statusClasses[status] || 'badge-pre-production';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'grading':
      case 'audio-mix':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalProjects = stats?.totalProjects || 0;
  const totalStudents = studentsData?.totalCount || 0;
  const statusBreakdown = stats?.statusBreakdown || [];

  const cards = [
    {
      name: 'Total Projects',
      value: totalProjects,
      icon: Film,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/projects',
    },
    {
      name: 'Active Students',
      value: totalStudents,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/students',
    },
    {
      name: 'In Production',
      value: statusBreakdown.find(s => s.status === 'post-production')?.count || 0,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/projects?status=post-production',
    },
    {
      name: 'Completed',
      value: statusBreakdown.find(s => s.status === 'complete')?.count || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/projects?status=complete',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your film production projects
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/projects/new"
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.name}
                  to={card.href}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-md ${card.bgColor}`}>
                          <Icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {card.name}
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
                            {statsLoading ? (
                              <div className="spinner"></div>
                            ) : (
                              card.value
                            )}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mt-8">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Projects
                </h3>
                <Link
                  to="/projects"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              {projectsLoading ? (
                <div className="p-6 text-center">
                  <div className="spinner mx-auto"></div>
                </div>
              ) : recentProjects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Film className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No projects yet</p>
                  <Link
                    to="/projects/new"
                    className="mt-2 text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Create your first project
                  </Link>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {recentProjects.map((project) => (
                      <li key={project.id}>
                        <Link
                          to={`/projects/${project.id}`}
                          className="block hover:bg-gray-50 px-6 py-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 flex-1">
                              {getStatusIcon(project.status)}
                              <div className="ml-4 min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {project.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {project.student
                                    ? `${project.student.firstName} ${project.student.lastName}`
                                    : 'No student assigned'}
                                </p>
                              </div>
                            </div>
                            <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                                {project.status.replace('-', ' ')}
                              </span>
                              {project.finalDeliveryDate && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(project.finalDeliveryDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/projects/new"
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="card-body text-center">
              <Plus className="w-12 h-12 mx-auto text-gray-400 group-hover:text-primary-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-primary-600">
                New Project
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Create a new film production project
              </p>
            </div>
          </Link>

          <Link
            to="/students/new"
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="card-body text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 group-hover:text-primary-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-primary-600">
                Add Student
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Register a new student in the system
              </p>
            </div>
          </Link>

          <Link
            to="/projects?status=post-production"
            className="card hover:shadow-md transition-shadow group"
          >
            <div className="card-body text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 group-hover:text-primary-500" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 group-hover:text-primary-600">
                View Schedule
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Check upcoming deadlines and dates
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;