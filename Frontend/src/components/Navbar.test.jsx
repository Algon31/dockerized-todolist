import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  it('renders the logo title and contact link', () => {
    render(<Navbar />);
    expect(screen.getByText('ToDo')).toBeInTheDocument();
    expect(screen.getByText('contact me')).toBeInTheDocument();
  });
});
