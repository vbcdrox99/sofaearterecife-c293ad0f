import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';

// Mock do contexto de autenticação
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: vi.fn(() => ({
    user: {
      id: '1',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Usuário Teste',
        avatar_url: null,
      },
    },
    signOut: vi.fn(),
  })),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock do window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('deve renderizar o logo da empresa', () => {
    renderWithProviders(<Sidebar isOpen={true} onToggle={mockOnToggle} />);
    expect(screen.getByText('SofáArte')).toBeInTheDocument();
  });

  it('deve exibir os itens de navegação', () => {
    renderWithProviders(<Sidebar isOpen={true} onToggle={mockOnToggle} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pedidos')).toBeInTheDocument();
    expect(screen.getByText('Clientes')).toBeInTheDocument();
    expect(screen.getByText('Materiais')).toBeInTheDocument();
    expect(screen.getByText('Produção')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
  });

  it('deve exibir informações do usuário', () => {
    renderWithProviders(<Sidebar isOpen={true} onToggle={mockOnToggle} />);
    
    expect(screen.getByText('Usuário Teste')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('deve ter um botão de logout', () => {
    renderWithProviders(<Sidebar isOpen={true} onToggle={mockOnToggle} />);
    
    const logoutButton = screen.getByRole('button', { name: /sair/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('deve chamar onToggle quando o botão de fechar for clicado em mobile', () => {
    // Mock para simular mobile
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderWithProviders(<Sidebar isOpen={true} onToggle={mockOnToggle} />);
    
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    fireEvent.click(closeButton);
    
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('deve aplicar classes corretas quando fechada', () => {
    const { container } = renderWithProviders(
      <Sidebar isOpen={false} onToggle={mockOnToggle} />
    );
    
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('w-0');
  });

  it('deve aplicar classes corretas quando aberta', () => {
    const { container } = renderWithProviders(
      <Sidebar isOpen={true} onToggle={mockOnToggle} />
    );
    
    const sidebar = container.querySelector('aside');
    expect(sidebar).toHaveClass('w-64');
  });
});