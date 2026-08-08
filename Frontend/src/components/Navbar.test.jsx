import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Navbar from './Navbar';

describe('Navbar Component', () => {
  it('renders the logo title and contact link', () => {
    render(<Navbar />);
    expect(screen.getByText(/ToDo/i)).toBeInTheDocument();
    expect(screen.getByText(/contact me/i)).toBeInTheDocument();
  });
});
