import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import EditorPage from './pages/EditorPage';

const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
};

jest.mock('./socket', () => ({
  initSocket: () => Promise.resolve(mockSocket),
}));

// Mock Editor component because CodeMirror requires getBoundingClientRect which jsdom doesn't implement
jest.mock('./components/Editor', () => {
  return function DummyEditor({ onCodeChange }) {
    return <div data-testid="mock-editor" />;
  };
});

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders preview iframe with sandbox="allow-scripts" attribute for security isolation', () => {
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/editor/test-room',
          state: { username: 'testuser', language: 'xml', languageName: 'HTML' },
        },
      ]}
    >
      <Routes>
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </MemoryRouter>
  );

  const runButton = screen.getByText(/EXECUTE LINK/i);
  runButton.click();

  const iframe = screen.getByTitle('preview');
  expect(iframe).toBeInTheDocument();
  expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
});
