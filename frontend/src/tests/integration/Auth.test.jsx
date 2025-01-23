import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API server
const server = setupServer(
  rest.post('http://localhost:8080/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          token: 'fake-token',
          user: { id: 1, email: 'test@example.com' }
        })
      );
    }
    return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('full login flow', async () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Navigate to login page
  const loginLink = screen.getByText(/login/i);
  fireEvent.click(loginLink);

  // Fill in the form
  fireEvent.change(screen.getByLabelText(/email address/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });

  // Submit the form
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  // Wait for navigation
  await waitFor(() => {
    expect(window.location.pathname).toBe('/dashboard');
  });
}); 