'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface ResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    title: string;
    render?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (row: any) => void;
  actions?: {
    view?: (row: any) => void;
    edit?: (row: any) => void;
    delete?: (row: any) => void;
  };
  emptyMessage?: string;
  loading?: boolean;
}

export default function ResponsiveTable({
  data,
  columns,
  onRowClick,
  actions,
  emptyMessage = 'No data available',
  loading = false
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Mobile view - Card layout
  const MobileView = () => (
    <div className="space-y-4">
      {data.map((row, index) => {
        const isExpanded = expandedRows.has(row._id || index.toString());
        return (
          <div 
            key={row._id || index} 
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
          >
            {/* Mobile Card Header */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleRow(row._id || index.toString())}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {columns.slice(0, 2).map((column, colIndex) => (
                    <div key={column.key} className={colIndex > 0 ? "mt-1" : ""}>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                        {column.title}
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {actions && (
                    <div className="flex space-x-1">
                      {actions.view && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.view!(row);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 touch-target"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {actions.edit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.edit!(row);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 touch-target"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {actions.delete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.delete!(row);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 touch-target"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <ChevronDown 
                    className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
            </div>

            {/* Mobile Card Details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <div className="pt-3 space-y-3">
                  {columns.slice(2).map((column) => (
                    <div key={column.key} className="flex">
                      <div className="w-32 text-xs text-gray-500 uppercase tracking-wide">
                        {column.title}
                      </div>
                      <div className="flex-1 text-sm text-gray-900">
                        {column.render 
                          ? column.render(row[column.key], row)
                          : row[column.key]
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Desktop view - Traditional table
  const DesktopView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto mobile-table-container">
        <table className="min-w-full divide-y divide-gray-200 mobile-table">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.title}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr 
                key={row._id || index} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]
                    }
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {actions.view && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.view!(row);
                          }}
                          className="text-blue-600 hover:text-blue-900 touch-target"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {actions.edit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.edit!(row);
                          }}
                          className="text-green-600 hover:text-green-900 touch-target"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {actions.delete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.delete!(row);
                          }}
                          className="text-red-600 hover:text-red-900 touch-target"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="responsive-table-container">
      {/* Hide on mobile, show on desktop */}
      <div className="hidden lg:block">
        <DesktopView />
      </div>
      
      {/* Show on mobile, hide on desktop */}
      <div className="lg:hidden">
        <MobileView />
      </div>
    </div>
  );
}