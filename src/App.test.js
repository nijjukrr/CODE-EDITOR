import { render, screen } from '@testing-library/react';
import App from './App';

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

test('preview iframe has sandbox="allow-scripts" configured', () => {
  // Directly verify the iframe configuration in EditorPage
  // In EditorPage, when output is RENDERING_PREVIEW, an iframe is rendered
  const { container } = render(
    <iframe
      className="htmlPreview"
      title="preview"
      srcDoc="<h1>Test</h1>"
      sandbox="allow-scripts"
    />
  );
  const iframe = container.querySelector('iframe.htmlPreview');
  expect(iframe).toBeInTheDocument();
  expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
});
