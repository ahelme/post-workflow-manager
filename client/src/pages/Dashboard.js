import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectsAPI, studentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// Icons removed for clean minimal design

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
      'development': 'badge-development',
      'pre-production': 'badge-pre-production',
      'shooting': 'badge-shooting',
      'post-production': 'badge-post-production',
      'grading': 'badge-grading',
      'audio-mix': 'badge-audio-mix',
      'complete': 'badge-complete',
    };
    return statusClasses[status] || 'badge-development';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete':
        return 'text-green-600';
      case 'grading':
      case 'audio-mix':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalProjects = stats?.totalProjects || 0;
  const totalStudents = studentsData?.totalCount || 0;
  const statusBreakdown = stats?.statusBreakdown || [];

  const cards = [
    {
      name: 'Total Projects',
      value: totalProjects,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      href: '/projects',
    },
    {
      name: 'Active Students',
      value: totalStudents,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      href: '/students',
    },
    {
      name: 'In Production',
      value: statusBreakdown.find(s => s.status === 'post-production')?.count || 0,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      href: '/projects?status=post-production',
    },
    {
      name: 'Completed',
      value: statusBreakdown.find(s => s.status === 'complete')?.count || 0,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      href: '/projects?status=complete',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold leading-7 text-gray-900">
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
              + New Project
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Link
                  key={card.name}
                  to={card.href}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center">
                      <div className="w-0 flex-1">
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
              ))}
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
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 mb-4 flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">🎬</span>
                  </div>
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
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)} bg-current opacity-70`}></div>
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
                                {project.status.split('-').join(' ')}
                              </span>
                              {project.finalDeliveryDate && (
                                <div className="text-sm text-gray-500">
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
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
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
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
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
              <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
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