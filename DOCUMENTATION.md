# Agency Management System - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation Guide](#installation-guide)
4. [Configuration](#configuration)
5. [Agency Types](#agency-types)
6. [Features Documentation](#features-documentation)
7. [API Documentation](#api-documentation)
8. [Deployment Guide](#deployment-guide)
9. [Customization](#customization)
10. [Troubleshooting](#troubleshooting)

## Overview

This is a comprehensive, generic agency management system built with Next.js 15, TypeScript, and MongoDB. The system is designed to be adaptable for various agency types including visa processing, immigration services, travel agencies, legal services, real estate, and business consulting.

### Key Features
- **Multi-agency Support**: Configurable for different agency types
- **Licensing System**: CodeCanyon-ready license management
- **Payment Processing**: Integrated payment handling
- **Advanced Reporting**: Analytics and business intelligence
- **Modern UI/UX**: Polished interface with animations
- **Multi-language Support**: Internationalization ready
- **Responsive Design**: Mobile-friendly interface

## System Architecture

### Technology Stack
- **Frontend**: Next.js 15.5.9 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Internationalization**: next-intl

### Project Structure
```
visa-agency/
├── app/                    # Next.js app directory
│   ├── [locale]/          # Internationalized routes
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── contexts/         # Context providers
│   └── hooks/           # Custom hooks
├── lib/                 # Business logic and utilities
│   ├── agency-framework.ts  # Generic agency framework
│   ├── license-manager.ts   # License management
│   ├── payment-processor.ts # Payment processing
│   ├── report-generator.ts  # Analytics and reporting
│   └── db.ts            # Database connection
├── models/              # Mongoose models
├── types/               # TypeScript types
├── messages/            # Translation files
└── public/              # Static assets
```

## Installation Guide

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd visa-agency
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agency-management

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# CodeCanyon Configuration
NEXT_PUBLIC_ITEM_ID=your-item-id
LICENSE_VALIDATION_ENDPOINT=https://your-validation-server.com/validate

# Payment Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret

# Email Configuration (optional)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@youragency.com
```

4. **Database Setup**
```bash
# Start MongoDB
mongod

# Run initial setup scripts
npm run seed
npm run setup-db
```

5. **Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Configuration

### Agency Configuration

The system supports multiple agency types through the agency framework:

```typescript
import { agencyFramework } from '@/lib/agency-framework';

// Initialize agency
const config = agencyFramework.initialize('visa', {
  name: 'My VisaPilot Agency',
  // Custom configuration options
});

// Check if module is enabled
if (agencyFramework.isModuleEnabled('billing')) {
  // Show billing features
}

// Get agency-specific terminology
const clientTerm = agencyFramework.getTerminology('client');
```

### Available Agency Types
- **visa**: Visa & Travel Agency / Student Consultancy
- **immigration**: Immigration Services
- **travel**: Travel Agency
- **legal**: Legal Services
- **real_estate**: Real Estate Agency
- **consulting**: Business Consulting

### License Configuration

The licensing system is CodeCanyon-ready:

```typescript
import { licenseManager } from '@/lib/license-manager';

// Validate license
const result = await licenseManager.validateLicense('license-key', 'your-domain.com');

if (result.valid) {
  // License is valid
  console.log('License validated successfully');
} else {
  // Handle invalid license
  console.error('License validation failed:', result.message);
}
```

## Features Documentation

### 1. Generic Agency Framework
- **Purpose**: Makes the system adaptable for different agency types
- **Key Components**: 
  - Agency configuration system
  - Dynamic terminology mapping
  - Module-based feature toggling
  - Workflow customization

### 2. Licensing System
- **Purpose**: CodeCanyon compliance and license management
- **Features**:
  - License validation with remote server
  - Local license caching
  - Demo license for development
  - Expiration warnings
  - Domain binding

### 3. Payment Processing
- **Purpose**: Handle payments and billing
- **Features**:
  - Multiple payment method support
  - Payment history tracking
  - Refund processing
  - Client billing management
  - Payment statistics

### 4. Advanced Reporting
- **Purpose**: Business analytics and insights
- **Features**:
  - Client analytics reports
  - Appointment tracking
  - Financial reporting
  - Dashboard analytics
  - CSV/JSON export
  - Historical report storage

### 5. Enhanced UI/UX
- **Purpose**: Modern, polished user interface
- **Features**:
  - Animated components
  - Responsive design
  - Loading states
  - Interactive elements
  - Professional styling
  - Accessibility compliance

## API Documentation

### REST API Endpoints

#### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
```

#### Agency Management
```
GET /api/agency/config
POST /api/agency/config
PUT /api/agency/config
```

#### License Management
```
POST /api/license/validate
GET /api/license/status
DELETE /api/license/remove
```

#### Payments
```
POST /api/payments/process
GET /api/payments/history
GET /api/payments/methods
POST /api/payments/refund
```

#### Reports
```
GET /api/reports/clients
GET /api/reports/appointments
GET /api/reports/payments
GET /api/reports/dashboard
POST /api/reports/export
```

## Deployment Guide

### Production Deployment Checklist

1. **Environment Variables**
   - Set production database connection
   - Configure domain and HTTPS
   - Set secure NextAuth secret
   - Configure payment gateway keys
   - Set up email service

2. **Database Optimization**
   - Enable MongoDB indexes
   - Set up database backups
   - Configure connection pooling
   - Monitor database performance

3. **Security Considerations**
   - HTTPS enforcement
   - CORS configuration
   - Rate limiting
   - Input validation
   - Security headers

4. **Performance Optimization**
   - Enable Next.js image optimization
   - Configure caching strategies
   - Optimize bundle size
   - Set up CDN for static assets

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Customization

### Adding New Agency Types

1. **Extend Agency Types**
```typescript
// In types/agency.ts
export type AgencyType = 'visa' | 'immigration' | 'travel' | 'legal' | 'real_estate' | 'consulting' | 'custom';

// In lib/agency-framework.ts
// Add new configuration
custom: {
  name: 'Custom Agency',
  modules: ['clients', 'projects', 'billing'],
  features: ['project_management', 'time_tracking'],
  terminology: {
    client: 'Client',
    case: 'Project',
    appointment: 'Meeting',
    document: 'File'
  },
  workflows: ['project_setup', 'milestone_tracking'],
  requiredFields: ['project_type', 'budget']
}
```

### Customizing UI Components

All UI components are located in `app/components/` and can be customized:
- **AnimatedUI.tsx**: Contains reusable animated components
- **AgencySetup.tsx**: Agency configuration interface
- **PaymentForm.tsx**: Payment processing UI
- **LicenseComponents.tsx**: License management UI

### Adding New Features

1. Create new modules in `lib/`
2. Add corresponding API routes in `app/api/`
3. Create UI components in `app/components/`
4. Update agency configurations
5. Add translations in `messages/`

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify connection string in .env
   - Check network/firewall settings

2. **License Validation Errors**
   - Verify domain matches license
   - Check license server availability
   - Validate license key format

3. **Payment Processing Issues**
   - Check payment gateway configuration
   - Verify API keys
   - Test with sandbox credentials first

4. **Build Errors**
   - Ensure Node.js version 18+
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors

### Support

For additional support:
- Check the GitHub issues
- Review the documentation
- Contact support team
- Check community forums

## Contributing

We welcome contributions to improve the system:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

This software is licensed under the CodeCanyon Regular/Extended License.
See LICENSE file for more details.

## Version History

- **v1.0.0**: Initial release with core agency management features
- **v1.1.0**: Added multi-agency support and generic framework
- **v1.2.0**: Integrated licensing system and CodeCanyon compliance
- **v1.3.0**: Added payment processing and enhanced reporting
- **v1.4.0**: Improved UI/UX with animations and modern design

## Credits

Built with:
- Next.js
- TypeScript
- MongoDB
- Tailwind CSS
- Framer Motion
- And many other open-source libraries

For more information, visit our documentation website or contact our support team.