import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen } from '@testing-library/react';

// --- Mocks ---
vi.mock('next/navigation', () => {
  // Make redirect THROW like Next.js does, so render halts in tests.
  const redirect = vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  });
  return { redirect };
});

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/app/components/MessageForm', () => ({
  default: () => <div data-testid="message-form" />,
}));

// Path is relative in the page file; keep specifier identical
vi.mock('@/app/components/MessagesServerFetcher', () => ({
  default: (props: { user: { name?: string } }) => (
    <div data-testid="messages-fetcher" data-user-name={props.user?.name ?? ''} />
  ),
}));

vi.mock('@/app/components/Minicomps/Signout', () => ({
  default: () => <button data-testid="signout-button" />,
}));

vi.mock('@/app/components/Minicomps/Loading', () => ({
  default: () => <div data-testid="loading" />,
}));

// --- Import after mocks ---
import Home from '@/app/page';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

describe('Home page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /api/auth/signin when not authenticated', async () => {
    (auth as unknown as Mock).mockResolvedValueOnce(null);

    // Home should throw due to redirect()
    await expect(Home({} as any)).rejects.toThrowError('NEXT_REDIRECT:/api/auth/signin');

    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/api/auth/signin');
  });

  it('renders with user name and child components when authenticated', async () => {
    (auth as unknown as Mock).mockResolvedValueOnce({ user: { name: 'John' } });

    const ui = await Home({} as any);
    render(ui);

    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/John/i)).toBeInTheDocument();

    expect(screen.getByTestId('signout-button')).toBeInTheDocument();
    expect(screen.getByTestId('message-form')).toBeInTheDocument();

    const fetcher = screen.getByTestId('messages-fetcher');
    expect(fetcher).toHaveAttribute('data-user-name', 'John');

    expect(redirect).not.toHaveBeenCalled();
  });
});
