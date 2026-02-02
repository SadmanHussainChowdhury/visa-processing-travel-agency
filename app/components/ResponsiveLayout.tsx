'use client';

import { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
  border?: boolean;
}

export function ResponsiveCard({
  children,
  title,
  subtitle,
  actions,
  className = '',
  padding = 'md',
  shadow = true,
  border = true
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`
      bg-white rounded-lg
      ${shadow ? 'shadow-lg' : ''}
      ${border ? 'border border-gray-200' : ''}
      ${paddingClasses[padding]}
      ${className}
      responsive-card
    `}>
      {(title || subtitle || actions) && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = ''
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  const colClasses = `
    grid
    ${gapClasses[gap]}
    ${className}
    responsive-grid
  `;

  return (
    <div className={colClasses}>
      {children}
    </div>
  );
}

interface ResponsiveGridItemProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveGridItem({
  children,
  className = ''
}: ResponsiveGridItemProps) {
  return (
    <div className={`responsive-grid-item ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveSectionProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function ResponsiveSection({
  children,
  title,
  description,
  actions,
  className = ''
}: ResponsiveSectionProps) {
  return (
    <div className={`responsive-content-section ${className}`}>
      {(title || description || actions) && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-gray-600">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

interface ResponsiveDashboardProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveDashboard({
  children,
  className = ''
}: ResponsiveDashboardProps) {
  return (
    <div className={`responsive-dashboard ${className}`}>
      {children}
    </div>
  );
}

interface ResponsiveStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
}

export function ResponsiveStatCard({
  title,
  value,
  description,
  icon,
  trend,
  className = ''
}: ResponsiveStatCardProps) {
  return (
    <div className={`
      bg-white rounded-lg shadow border border-gray-200 p-6
      responsive-card
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">{trend.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface ResponsiveActionCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ResponsiveActionCard({
  title,
  description,
  icon,
  onClick,
  disabled = false,
  className = ''
}: ResponsiveActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left bg-white rounded-lg shadow border border-gray-200 p-6
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        responsive-card
        ${className}
      `}
    >
      <div className="flex items-start space-x-4">
        {icon && (
          <div className="flex-shrink-0 text-blue-600">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
}