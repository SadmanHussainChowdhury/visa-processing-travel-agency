import { render, screen } from '@testing-library/react';
import MessageTemplatesPage from '../app/notifications/templates/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  FileText: () => <div data-testid="file-text-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  MessageSquare: () => <div data-testid="message-square-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Edit3: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Copy: () => <div data-testid="copy-icon" />,
  Search: () => <div data-testid="search-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
}));

// Mock ProtectedRoute and SidebarLayout
jest.mock('../app/protected-route', () => {
  return function MockProtectedRoute({ children }: { children: React.ReactNode }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('../app/components/sidebar-layout', () => {
  return function MockSidebarLayout({ children, title }: { children: React.ReactNode; title: string }) {
    return (
      <div data-testid="sidebar-layout">
        <h1>{title}</h1>
        {children}
      </div>
    );
  };
});

describe('Message Templates Page', () => {
  it('renders without crashing', () => {
    render(<MessageTemplatesPage />);
    
    // Check if the main components render
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-layout')).toBeInTheDocument();
    
    // Check if the title is correct
    expect(screen.getByText('Message Templates')).toBeInTheDocument();
  });

  it('displays template list with mock data', () => {
    render(<MessageTemplatesPage />);
    
    // Check if template names are displayed
    expect(screen.getByText('Visa Approval Notification')).toBeInTheDocument();
    expect(screen.getByText('Document Reminder')).toBeInTheDocument();
    expect(screen.getByText('Appointment Confirmation')).toBeInTheDocument();
  });

  it('shows correct template counts', () => {
    render(<MessageTemplatesPage />);
    
    // Check if the template count badge is displayed
    const templateCountBadge = screen.getByText(/\d+ templates?/);
    expect(templateCountBadge).toBeInTheDocument();
  });
});