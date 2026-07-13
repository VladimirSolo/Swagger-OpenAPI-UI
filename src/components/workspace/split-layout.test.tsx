import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSplitOrientation } from '@/hooks/use-split-orientation';
import { SplitLayout } from './split-layout';

vi.mock('@/hooks/use-split-orientation', () => ({ useSplitOrientation: vi.fn() }));

describe('SplitLayout', () => {
  it('renders both panels and exposes the current orientation', () => {
    vi.mocked(useSplitOrientation).mockReturnValue('horizontal');

    render(
      <SplitLayout editor={<div data-testid="editor" />} viewer={<div data-testid="viewer" />} />,
    );

    expect(screen.getByTestId('editor')).toBeInTheDocument();
    expect(screen.getByTestId('viewer')).toBeInTheDocument();
    expect(screen.getByTestId('split-layout')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('reflects vertical orientation on narrow viewports', () => {
    vi.mocked(useSplitOrientation).mockReturnValue('vertical');

    render(<SplitLayout editor={<div />} viewer={<div />} />);

    expect(screen.getByTestId('split-layout')).toHaveAttribute('data-orientation', 'vertical');
  });
});
