import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders correctly', () => {
    render(<ChatInput onSend={() => {}} disabled={false} />);
    expect(screen.getByPlaceholderText('Ask AI anything...')).toBeInTheDocument();
  });

  it('allows user to type', async () => {
    render(<ChatInput onSend={() => {}} disabled={false} />);
    const input = screen.getByPlaceholderText('Ask AI anything...');
    await userEvent.type(input, 'Hello world');
    expect(input).toHaveValue('Hello world');
  });

  it('calls onSend and clears input when form is submitted', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    const input = screen.getByPlaceholderText('Ask AI anything...');
    await userEvent.type(input, 'Hello world');

    const submitButton = screen.getByRole('button');
    await userEvent.click(submitButton);

    expect(handleSend).toHaveBeenCalledWith('Hello world');
    expect(input).toHaveValue('');
  });

  it('does not call onSend when input is empty', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={false} />);

    const submitButton = screen.getByRole('button');
    await userEvent.click(submitButton);

    expect(handleSend).not.toHaveBeenCalled();
  });

  it('disables input and button when disabled is true', async () => {
    render(<ChatInput onSend={() => {}} disabled={true} />);

    const input = screen.getByPlaceholderText('Ask AI anything...');
    const submitButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});