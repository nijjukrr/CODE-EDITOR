import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page main label', () => {
  render(<App />);
  const headingElement = screen.getByText(/enter matrix/i);
  expect(headingElement).toBeInTheDocument();
});
