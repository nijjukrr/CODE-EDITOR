import { render, screen } from '@testing-library/react';
import App from './App';

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

describe('Execution payload validation logic', () => {
  const validateExecutionInput = (body) => {
    const { language, code, input } = body || {};
    if (typeof language !== 'string' || typeof code !== 'string') {
      return { valid: false, error: 'Invalid or missing language or code parameter.' };
    }
    if (code.length > 10000 || (input && typeof input === 'string' && input.length > 10000)) {
      return { valid: false, error: 'Payload length exceeds maximum limit of 10,000 characters.' };
    }
    return { valid: true };
  };

  test('rejects missing or non-string language or code', () => {
    expect(validateExecutionInput({ language: 123, code: 'print(1)' }).valid).toBe(false);
    expect(validateExecutionInput({ language: 'python' }).valid).toBe(false);
    expect(validateExecutionInput({ code: 'print(1)' }).valid).toBe(false);
  });

  test('rejects code payload exceeding character limit', () => {
    const hugeCode = 'a'.repeat(10001);
    expect(validateExecutionInput({ language: 'python', code: hugeCode }).valid).toBe(false);
  });

  test('accepts valid execution payload', () => {
    expect(validateExecutionInput({ language: 'python', code: 'print("Hello World")' }).valid).toBe(true);
  });
});
