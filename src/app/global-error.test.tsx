import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GlobalError from './global-error';

describe('GlobalError', () => {
  it('shows a friendly message, logs the error, and calls reset on click', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new Error('boom'), { digest: 'xyz' });
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(error);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
