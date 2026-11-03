import { render, screen } from '@testing-library/react';
import App from './App';

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

test('ensures EditorPage defines sandboxed iframe for HTML preview', () => {
  const fs = require('fs');
  const path = require('path');
  const editorPageSource = fs.readFileSync(path.resolve(__dirname, 'pages/EditorPage.js'), 'utf8');
  expect(editorPageSource).toMatch(/sandbox="allow-scripts"/);
  expect(editorPageSource).not.toMatch(/sandbox="[^"]*allow-same-origin/);
});
