import { describe, it, expect } from 'vitest';
import React from 'react';
import { linkify } from '@/lib/linkify';

describe('linkify', () => {
  it('returns the plain string when there are no URLs', () => {
    const result = linkify('Hello world', false);
    expect(result).toBe('Hello world');
  });

  it('returns an array with a link element for a single URL', () => {
    const result = linkify('https://example.com', false);
    expect(Array.isArray(result)).toBe(true);

    const nodes = result as React.ReactNode[];
    const link = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(link).toBeDefined();
    expect(link!.props.href).toBe('https://example.com');
  });

  it('splits text around a URL correctly', () => {
    const result = linkify('Visit https://example.com today', false);
    const nodes = result as React.ReactNode[];

    expect(nodes).toContain('Visit ');
    expect(nodes).toContain(' today');

    const link = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(link).toBeDefined();
    expect(link!.props.href).toBe('https://example.com');
  });

  it('handles multiple URLs in a single string', () => {
    const result = linkify('https://foo.com and https://bar.com', false);
    const nodes = result as React.ReactNode[];

    const links = nodes.filter(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(links).toHaveLength(2);
    expect(links[0].props.href).toBe('https://foo.com');
    expect(links[1].props.href).toBe('https://bar.com');
  });

  it('applies "text-blue-600" class when isCurrentUser is false', () => {
    const result = linkify('https://example.com', false);
    const nodes = result as React.ReactNode[];

    const link = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(link!.props.className).toContain('text-blue-600');
  });

  it('applies "underline" class (no text-blue-600) when isCurrentUser is true', () => {
    const result = linkify('https://example.com', true);
    const nodes = result as React.ReactNode[];

    const link = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(link!.props.className).toContain('underline');
    expect(link!.props.className).not.toContain('text-blue-600');
  });

  it('sets target="_blank" and rel="noopener noreferrer" on links', () => {
    const result = linkify('https://example.com', false);
    const nodes = result as React.ReactNode[];

    const link = nodes.find(
      (n): n is React.ReactElement => React.isValidElement(n) && n.type === 'a'
    );
    expect(link!.props.target).toBe('_blank');
    expect(link!.props.rel).toBe('noopener noreferrer');
  });
});
