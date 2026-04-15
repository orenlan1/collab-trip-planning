// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AddExpenseDialog } from '@/pages/budget/components/AddExpenseDialog';
import { useTripStore } from '@/stores/tripStore';
import type { TripMember } from '@/types/tripMember';

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/stores/tripStore', () => ({ useTripStore: vi.fn() }));

vi.mock('@/pages/budget/hooks/useFetchCurrencies', () => ({
  useFetchCurrencies: () => ({
    currencies: [{ code: 'USD', name: 'US Dollar', symbol: '$' }],
    isLoading: false,
    error: null,
  }),
}));

// Simplify Radix Dialog to plain HTML — avoids portal / focus-trap issues in jsdom
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Simplify Radix Popover — Calendar trigger not relevant to these tests
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Avoid react-day-picker rendering complexity
vi.mock('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid="calendar" />,
}));

// Avoid Radix Avatar image-load state machine
vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ alt, fallback }: { alt?: string; fallback?: string }) => (
    <div aria-label={alt}>{fallback}</div>
  ),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockMember: TripMember = {
  id: 'member-1',
  userId: 'user-1',
  role: 'creator',
  user: { id: 'user-1', email: 'alice@test.com', name: 'Alice', image: null },
};

// Stable reference — must NOT be inline `[mockMember]` inside the mock factory.
// AddExpenseDialog has a useEffect([tripMembers, open]) that calls setFormData.
// If the array reference changes every render (new [] each call), the effect
// fires on every render → setFormData → re-render → infinite loop → OOM.
const mockMembers = [mockMember];

// ── Helpers ───────────────────────────────────────────────────────────────────

const onOpenChange = vi.fn();
const onSubmit = vi.fn();

const renderDialog = (props: Partial<React.ComponentProps<typeof AddExpenseDialog>> = {}) => {
  const result = render(
    <AddExpenseDialog
      open={true}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      {...props}
    />
  );
  return result;
};

// Submit the form directly to bypass HTML5 constraint validation
const submitForm = (container: HTMLElement) => {
  fireEvent.submit(container.querySelector('form')!);
};

// Fill all fields that our custom validation checks
const fillValidForm = () => {
  fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner' } });
  fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '50' } });
  fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  onSubmit.mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(useTripStore).mockImplementation((selector: any) =>
    selector({ members: mockMembers })
  );
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('rendering', () => {
  it('shows the dialog title when open', () => {
    renderDialog();
    expect(screen.getByRole('heading', { name: 'Add Expense' })).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Add Expense')).not.toBeInTheDocument();
  });

  it('pre-fills description from the activity prop', () => {
    renderDialog({ activity: { id: 'act-1', name: 'Museum visit', createdAt: '' } });
    expect(screen.getByLabelText(/description/i)).toHaveValue('Museum visit');
  });

  it('renders Cancel and Add Expense buttons', () => {
    renderDialog();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add expense/i })).toBeInTheDocument();
  });

  it('pre-selects all trip members on open', async () => {
    renderDialog();
    // The useEffect that seeds selectedMemberIds runs after mount
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });
});

describe('validation', () => {
  it('shows error when cost is empty', async () => {
    const { container } = renderDialog();
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Please enter a valid cost')).toBeInTheDocument()
    );
  });

  it('shows error when cost is zero', async () => {
    const { container } = renderDialog();
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '0' } });
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Please enter a valid cost')).toBeInTheDocument()
    );
  });

  it('shows error when cost is negative', async () => {
    const { container } = renderDialog();
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '-5' } });
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Please enter a valid cost')).toBeInTheDocument()
    );
  });

  it('shows error when description is blank', async () => {
    const { container } = renderDialog();
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    // description is empty by default
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Please enter a description')).toBeInTheDocument()
    );
  });

  it('shows error when currency is not selected', async () => {
    const { container } = renderDialog();
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Dinner' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '50' } });
    // currency left empty
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Please select a currency')).toBeInTheDocument()
    );
  });
});

describe('successful submission', () => {
  it('calls onSubmit with the correct payload', async () => {
    const { container } = renderDialog();
    fillValidForm();
    submitForm(container);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Dinner',
          cost: 50,
          category: 'FOOD',
          currency: 'USD',
          splitMemberIds: ['member-1'],
        })
      )
    );
  });

  it('closes the dialog after a successful submit', async () => {
    const { container } = renderDialog();
    fillValidForm();
    submitForm(container);
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it('includes the activityId when an activity is provided', async () => {
    const { container } = renderDialog({
      activity: { id: 'act-1', name: 'Museum visit', createdAt: '' },
    });
    // description is pre-filled; just fill cost + currency
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/currency/i), { target: { value: 'USD' } });
    submitForm(container);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ activityId: 'act-1' })
      )
    );
  });
});

describe('submission failure', () => {
  it('shows a generic error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValue(new Error('Network error'));
    const { container } = renderDialog();
    fillValidForm();
    submitForm(container);
    await waitFor(() =>
      expect(screen.getByText('Failed to add expense')).toBeInTheDocument()
    );
  });

  it('does not close the dialog when onSubmit rejects', async () => {
    onSubmit.mockRejectedValue(new Error('Network error'));
    const { container } = renderDialog();
    fillValidForm();
    submitForm(container);
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});

describe('cancel button', () => {
  it('calls onOpenChange(false) when Cancel is clicked', () => {
    renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
