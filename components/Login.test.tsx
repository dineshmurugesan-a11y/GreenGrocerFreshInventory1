import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';
import { USERS } from '../constants';

describe('Login Component', () => {
  it('renders the login form', () => {
    render(<Login onLogin={jest.fn()} />);
    expect(screen.getByRole('heading', { name: /greengrocer/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to type into email and password fields', () => {
    render(<Login onLogin={jest.fn()} />);
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('calls onLogin with user data for valid credentials', () => {
    const handleLogin = jest.fn();
    render(<Login onLogin={handleLogin} />);
    const validUser = USERS[0];

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: validUser.email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'anypassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(handleLogin).toHaveBeenCalledTimes(1);
    expect(handleLogin).toHaveBeenCalledWith(validUser);
  });

  it('shows an error message for invalid credentials', () => {
    render(<Login onLogin={jest.fn()} />);
    
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@user.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('prefills fields when clicking on a mock user button', async () => {
      render(<Login onLogin={jest.fn()} />);
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      
      const storeMgrButton = screen.getByRole('button', { name: /store mgr/i });
      fireEvent.click(storeMgrButton);

      await waitFor(() => {
          expect(emailInput.value).toBe(USERS[0].email);
          expect(passwordInput.value).toBe('password123');
      });
  });
});
