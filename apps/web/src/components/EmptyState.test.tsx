import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders with title and description', () => {
    render(<EmptyState title="暂无数据" description="请添加一些内容" />);
    expect(screen.getByText('暂无数据')).toBeInTheDocument();
    expect(screen.getByText('请添加一些内容')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    const Icon = () => <span data-testid="icon">📭</span>;
    render(<EmptyState title="空" icon={<Icon />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
