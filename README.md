# visa-processing-travel-agency
A web-based platform that streamlines visa application processing with features like document management, appointment scheduling, real-time status tracking, and an admin dashboard for travel agencies and consultants.
>>>>>>> 79cbd15bacfdc34b7a499fe940b9833e8a8f6eda
# Visa Processing Travel Agency

A comprehensive, AI-powered visa processing travel agency software built with Next.js, TypeScript, and Tailwind CSS. This system provides travel agency professionals with tools to manage clients, visa applications, travel documents, and access AI-powered travel assistance.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Login System**: Professional authentication with email/password
- **Protected Routes**: All sensitive pages require authentication
- **Session Management**: Persistent login state with secure cookies
- **Role-based Access**: User role management system

### 🎨 Modern User Interface
- **Vertical Sidebar Navigation**: Professional left sidebar layout optimized for travel agency workflows
- **Responsive Design**: Mobile-first design with collapsible sidebar for mobile devices
- **Clean Dashboard**: Modern card-based layout with statistics and quick actions
- **Consistent Navigation**: Unified sidebar across all protected pages
- **Professional Styling**: Travel agency-appropriate color scheme and typography

### Core Management
- **Client Management**: Complete client records with visa applications, contact information, and travel details
- **Appointment Scheduling**: Advanced appointment booking system with time slot management
- **Document Management**: Comprehensive document upload, preview, and management system
- **Visa Case Management**: Track visa application status from draft to decision
- **Dashboard Analytics**: Real-time insights into agency performance and client statistics

### Specialized Features
- **Form Library & Templates**: Pre-configured visa application forms
- **Dynamic Forms**: Customizable forms per country requirements
- **Auto-fill**: Populate forms from client database
- **Export Capabilities**: Export forms to PDF/Word

### User Experience
- **Intuitive Navigation**: Vertical sidebar with clear icons and labels
- **Quick Actions**: Easy access to common tasks from the sidebar
- **Mobile Optimized**: Responsive design that works on all devices
- **Fast Performance**: Built with Next.js 15 and Turbopack for optimal speed
- **Type Safety**: Full TypeScript implementation for robust development

## 🛠️ Technology Stack

### Core Framework
- **Next.js**: 15.5.9 (with App Router)
- **React**: 19.2.1
- **React DOM**: 19.2.1
- **TypeScript**: ^5
- **Build Tool**: Turbopack (built into Next.js 15)

### Authentication & Database
- **NextAuth.js**: ^4.24.13 (security patch applied)
- **Mongoose**: ^9.0.0 (major version update)
- **MongoDB**: ^6.18.0
- **@auth/mongodb-adapter**: ^3.10.0
- **bcryptjs**: ^3.0.2

### UI & Styling
- **Tailwind CSS**: ^4
- **Lucide React**: ^0.555.0 (updated from 0.541.0)
- **React Hot Toast**: ^2.6.0

### Additional Libraries
- **next-intl**: ^4.3.6 (internationalization)
- **html2canvas**: ^1.4.1
- **jspdf**: ^3.0.2
- **cookies-next**: ^6.1.0

### Security Status
✅ **0 Security Vulnerabilities** - All packages updated to latest secure versions:
- NextAuth.js 4.24.13: Fixed email misdelivery vulnerability
- js-yaml 4.1.1+: Fixed prototype pollution (via npm overrides)
- All critical security patches applied

## 📁 Project Structure

```
visa-processing-travel-agency/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main Dashboard (Protected)
│   ├── login/                   # Authentication
│   │   └── page.tsx            # Login Form
│   ├── clients/                 # Client Management (Protected)
│   │   ├── page.tsx            # Clients List
│   │   └── new/                # Add New Client
│   │       └── page.tsx
│   ├── appointments/            # Appointment Management (Protected)
│   │   ├── page.tsx            # Appointments List
│   │   └── new/                # Schedule Appointment
│   │       └── page.tsx
│   ├── documents/               # Document Management (Protected)
│   │   ├── page.tsx            # Documents List
│   │   └── upload/             # Upload Documents
│   │       └── page.tsx
│   ├── visa-cases/              # Visa Case Management (Protected)
│   │   ├── page.tsx            # Visa Cases List
│   │   └── new/                # Create Visa Case
│   │       └── page.tsx
│   ├── forms/                   # Form Library & Templates (Protected)
│   │   ├── page.tsx            # Forms Library
│   │   └── new/                # Create Form Template
│   │       └── page.tsx
│   ├── components/              # Reusable Components
│   │   └── sidebar-layout.tsx  # Main Sidebar Layout
│   ├── layout.tsx               # Root Layout with AuthProvider
│   ├── auth-context.tsx         # Authentication Context
│   ├── protected-route.tsx      # Route Protection Component
│   └── globals.css              # Global Styles
├── models/                       # Mongoose Models
│   ├── Client.ts               # Client Schema
│   ├── Appointment.ts          # Appointment Schema
│   ├── Document.ts             # Document Schema
│   ├── VisaCase.ts             # Visa Case Schema
│   └── FormTemplate.ts         # Form Template Schema
├── lib/                          # Utility Functions
│   └── mongodb.ts              # Database Connection
├── middleware.ts                 # Authentication Middleware
├── public/                       # Static Assets
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript Configuration
├── next.config.ts               # Next.js Configuration
└── README.md                    # Project Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd visa-processing-travel-agency
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔐 Login Credentials

**Demo Account:**
- **Email**: `admin@visaagency.com`
- **Password**: `password123`

*Note: This is a demo system. In production, implement proper authentication with your backend.*

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Pages

### Login (`/login`)
- Professional authentication interface
- Email and password validation
- Remember me functionality
- Demo credentials display

### Dashboard (`/`)
- Overview of agency statistics
- Recent appointments
- Quick actions for common tasks
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

### Clients (`/clients`)
- Client directory with search and filtering
- Client status management
- Quick access to client records
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

### Appointments (`/appointments`)
- Daily appointment schedule
- Appointment status tracking
- Time slot management
- Consultant assignment
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

### Documents (`/documents`)
- Document library with search and filtering
- Document upload functionality
- Preview and download capabilities
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

### Visa Cases (`/visa-cases`)
- Visa application tracking
- Status management from draft to decision
- Document checklists per visa type
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

### Forms Library (`/forms`)
- Form template management
- Dynamic form creation
- Export capabilities
- **Protected Route** - Requires authentication
- **Vertical Sidebar** - Consistent navigation

## 🔧 Configuration

### Next.js Configuration
The project uses Next.js 15 with the following optimizations:
- App Router for modern routing
- Turbopack for fast builds
- TypeScript for type safety
- Tailwind CSS for styling

### Authentication System
- **Context-based**: Uses React Context for state management
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Session Persistence**: Login state maintained with secure cookies
- **Role Management**: User role-based access control
- **Middleware**: Server-level authentication checks

### Layout System
- **Reusable Sidebar**: Consistent navigation across all protected pages
- **Responsive Design**: Mobile-optimized with collapsible sidebar
- **Professional UI**: Travel agency-appropriate design patterns
- **Quick Actions**: Easy access to common tasks

### Tailwind CSS
Custom Tailwind configuration with:
- Responsive design utilities
- Custom color schemes
- Component-based styling
- Dark mode support (ready for implementation)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar with expanded navigation
- **Tablet**: Adaptive sidebar with touch-friendly controls
- **Mobile**: Collapsible sidebar with mobile-optimized layout
- **Touch Interfaces**: Optimized for touch devices

## 🔒 Security Features

- **Authentication Required**: All sensitive pages protected
- **Form Validation**: Client and server-side validation
- **Secure Routing**: Protected route implementation
- **Input Sanitization**: XSS protection
- **Session Management**: Secure cookie handling
- **Middleware Protection**: Server-level route protection

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Other Platforms
The application can be deployed to any platform that supports Node.js:
- Netlify
- AWS
- Google Cloud
- DigitalOcean

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔮 Future Enhancements

- **Real Authentication**: Integration with Auth0, Firebase Auth, or custom backend
- **Multi-factor Authentication**: SMS/Email verification
- **User Management**: Admin panel for user creation and management
- **Advanced Sidebar**: Collapsible sections and custom navigation
- **Advanced Document Processing**: OCR and automated form filling
- **Billing Integration**: Payment processing and invoice management
- **Mobile App**: Native mobile applications
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Internationalization
- **Customizable Dashboard**: User-configurable widgets and layouts

---

Built with ❤️ for travel agency professionals
=======
# visa-processing-travel-agency
A web-based platform that streamlines visa application processing with features like document management, appointment scheduling, real-time status tracking, and an admin dashboard for travel agencies and consultants.
>>>>>>> 79cbd15bacfdc34b7a499fe940b9833e8a8f6eda
