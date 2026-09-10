import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';
import Navbar from './Navbar';
import { AuthProvider } from '../context/AuthContext';

describe('Navbar Component', () => {
  it('renders the brand title and sign in button when unauthenticated', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );
    expect(screen.getByText(/TaskFlow/i)).toBeInTheDocument();
    expect(screen.getByText(/v2.0/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});
