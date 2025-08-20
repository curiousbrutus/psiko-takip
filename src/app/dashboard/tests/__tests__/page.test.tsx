import { render, screen } from '@testing-library/react';
import TestsPage from '@/app/dashboard/tests/page';

// Mock the Link component from Next.js
jest.mock('next/link', () => {
  const MockedLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockedLink.displayName = 'MockedLink';
  return MockedLink;
});

describe('TestsPage', () => {
  it('renders the page title correctly', () => {
    render(<TestsPage />);

    expect(screen.getByText('Mevcut Testler')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<TestsPage />);

    expect(
      screen.getByText(/Aşağıdaki testleri tamamladıktan sonra/)
    ).toBeInTheDocument();
  });

  it('renders all available tests', () => {
    render(<TestsPage />);

    // Check for Beck Depression Inventory (now shows short title)
    expect(screen.getByText('Beck Depresyon')).toBeInTheDocument();

    // Check for Burnout Inventory
    expect(screen.getByText('Tükenmişlik')).toBeInTheDocument();

    // Check for Young Schema Questionnaire (disabled)
    expect(screen.getByText('Young Şema')).toBeInTheDocument();

    // Check for MMPI Short Form (disabled)
    expect(screen.getByText('MMPI')).toBeInTheDocument();
  });

  it('shows enabled and disabled test buttons', () => {
    render(<TestsPage />);

    // Check that we have test buttons - both enabled and disabled
    const allTextNodes = screen.getAllByText(/Teste Başla|Yakında/);
    expect(allTextNodes.length).toBeGreaterThanOrEqual(4); // Should have at least 4 buttons
  });

  it('has correct links for enabled tests', () => {
    render(<TestsPage />);

    // Get all links and check the correct hrefs exist
    const links = screen.getAllByRole('link');
    const hrefs = links.map(link => link.getAttribute('href'));

    expect(hrefs).toContain('/dashboard/tests/beck-depression-inventory');
    expect(hrefs).toContain('/dashboard/tests/burnout-inventory');
  });

  it('has proper accessibility structure', () => {
    render(<TestsPage />);

    // Check for proper heading structure (updated title)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Psikolojik Değerlendirmeler'
    );

    // Check for proper button roles
    const buttons = screen.getAllByRole('link');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders test descriptions correctly', () => {
    render(<TestsPage />);

    expect(
      screen.getByText(/Depresyonun şiddetini ölçmek için/)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/İşle ilgili stresi, duygusal tükenmeyi/)
    ).toBeInTheDocument();
  });

  it('renders icons for each test', () => {
    render(<TestsPage />);

    // Check that icons are rendered (mocked as strings)
    expect(screen.getAllByText('BrainCircuit').length).toBeGreaterThanOrEqual(
      3
    ); // Beck, Young Schema, MMPI
    expect(screen.getAllByText('Flame').length).toBeGreaterThanOrEqual(1); // Burnout
  });

  it('renders correct test categories and structure', () => {
    render(<TestsPage />);

    // Check the main content container exists  
    const container = screen.getByText('Psikolojik Değerlendirmeler').closest('div');
    expect(container).toBeInTheDocument();

    // Should contain the main test types (checking short titles)
    expect(screen.getByText(/Beck Depresyon/)).toBeInTheDocument();
    expect(screen.getByText(/Tükenmişlik/)).toBeInTheDocument();
    expect(screen.getByText(/Young Şema/)).toBeInTheDocument();
    expect(screen.getByText(/MMPI/)).toBeInTheDocument();
  });
});
