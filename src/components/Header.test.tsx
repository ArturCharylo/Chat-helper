import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Minus: () => <div data-testid="icon-minus" />,
  X: () => <div data-testid="icon-x" />,
  Move: () => <div data-testid="icon-move" />,
}));

// Mock @tauri-apps/api/window
const mockStartDragging = vi.fn();
const mockMinimize = vi.fn();
const mockClose = vi.fn();

vi.mock('@tauri-apps/api/window', () => ({
  getCurrentWindow: () => ({
    startDragging: (...args: any[]) => mockStartDragging(...args),
    minimize: (...args: any[]) => mockMinimize(...args),
    close: (...args: any[]) => mockClose(...args),
  }),
}));

describe('Header', () => {
  it('renders correctly', () => {
    render(<Header />);
    expect(screen.getByText('AI Invisible Overlay')).toBeInTheDocument();
    expect(screen.getByTestId('icon-move')).toBeInTheDocument();
    expect(screen.getByTestId('icon-minus')).toBeInTheDocument();
    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });

  it('calls startDragging when header is mouse-downed', async () => {
    render(<Header />);
    const headerElement = screen.getByText('AI Invisible Overlay').parentElement?.parentElement;
    if (!headerElement) throw new Error('Header not found');

    // Simulate mousedown
    const event = new MouseEvent('mousedown', { bubbles: true });
    headerElement.dispatchEvent(event);

    expect(mockStartDragging).toHaveBeenCalled();
  });

  it('calls minimize when minimize button is clicked', async () => {
    render(<Header />);
    const minimizeButton = screen.getByTestId('icon-minus').parentElement;
    if (!minimizeButton) throw new Error('Minimize button not found');

    await userEvent.click(minimizeButton);
    expect(mockMinimize).toHaveBeenCalled();
  });

  it('calls close when close button is clicked', async () => {
    render(<Header />);
    const closeButton = screen.getByTestId('icon-x').parentElement;
    if (!closeButton) throw new Error('Close button not found');

    await userEvent.click(closeButton);
    expect(mockClose).toHaveBeenCalled();
  });
});
