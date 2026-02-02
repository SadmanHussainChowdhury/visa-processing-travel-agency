'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../protected-route';
import SidebarLayout from '../components/sidebar-layout';
import { useTranslations } from '../hooks/useTranslations';
import { 
  Activity,
  Calendar,
  Users,
  FileText,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  status?: string;
  icon?: any;
  color?: string;
}

export default function ActivityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, translationsLoaded } = useTranslations();

  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Show 10 activities per page
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/activity?limit=${itemsPerPage}&skip=${(currentPage - 1) * itemsPerPage}`);

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();

        // Transform activities with icons and colors
        const transformedActivities = data.activities.map((activity: any) => {
          let icon, color;
          switch (activity.type) {
            case 'appointment':
              icon = Calendar;
              color = 'green';
              break;
            case 'client':
              icon = Users;
              color = 'blue';
              break;
            case 'report':
              icon = FileText;
              color = 'purple';
              break;
            default:
              icon = Activity;
              color = 'gray';
          }

          return {
            ...activity,
            icon,
            color
          };
        });

        setActivities(transformedActivities);
        setTotalItems(data.total || transformedActivities.length);
        setTotalPages(Math.ceil(data.total / itemsPerPage) || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities');
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (translationsLoaded) {
      fetchActivities();
    }
  }, [translationsLoaded, currentPage, itemsPerPage]);

  // Show loading while checking authentication
  if (status === 'loading' || !translationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    if (totalPages <= 1) {
      // Always show page 1 when there are results but only one page
      pageNumbers.push(1);
    } else {
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max visible
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show first page
        pageNumbers.push(1);
        
        if (currentPage > 3) {
          pageNumbers.push('...');
        }
        
        // Show current page and surrounding pages
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        
        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== totalPages) {
            pageNumbers.push(i);
          }
        }
        
        if (currentPage < totalPages - 2) {
          pageNumbers.push('...');
        }
        
        // Show last page
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <ProtectedRoute>
      <SidebarLayout 
        title={t('activity.title') || 'All Activity'} 
        description={t('activity.description') || 'View all recent activities in your agency'}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('activity.backToDashboard') || 'Back to Dashboard'}</span>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('activity.refresh') || 'Refresh'}</span>
            </button>
          </div>

          {/* Activity List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('activity.allActivities') || 'All Activities'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activities.length} {t('activity.totalActivities') || 'total activities'}
              </p>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    // Define navigation links for each activity type
                    let href = '#';
                    if (activity.type === 'client') {
                      href = '/clients';
                    } else if (activity.type === 'appointment') {
                      href = `/appointments/${activity.id}`;
                    } else if (activity.type === 'report') {
                      href = `/reports/${activity.id}`;
                    }

                    return (
                      <Link
                        key={activity.id}
                        href={href}
                        className="flex items-start space-x-3 hover:bg-gray-50 p-3 rounded-lg transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className={`p-2 rounded-full bg-${activity.color}-100 flex-shrink-0`}>
                          <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400">{activity.time}</p>
                            {activity.status && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                activity.status === 'completed' || activity.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : activity.status === 'pending' || activity.status === 'scheduled'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {activity.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('activity.noActivities') || 'No activities found'}</p>
                </div>
              )}
              
              {/* Pagination */}
              {activities.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="ml-2">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex space-x-1">
                      {getPageNumbers().map((number, index) => (
                        <button
                          key={index}
                          onClick={() => typeof number === 'number' && paginate(number)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            number === currentPage
                              ? 'z-10 bg-blue-600 text-white border-blue-600'
                              : typeof number === 'string'
                              ? 'text-gray-400 bg-white border-gray-300 cursor-default'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                          disabled={typeof number === 'string'}
                        >
                          {number}
                        </button>
                      ))}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage >= totalPages
                          ? 'text-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      <span className="mr-2">Next</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarLayout>
    </ProtectedRoute>
  );
}

