import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import EditorPage from './pages/EditorPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as socketModule from './socket';

// Mock Editor component directly to avoid CodeMirror DOM/mode import issues in Jest/jsdom
jest.mock('./components/Editor', () => {
  return function MockEditor({ onCodeChange }) {
    return (
      <textarea
        id="realtimeEditor"
        data-testid="mock-editor"
        onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
      />
    );
  };
});

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders sandboxed iframe for HTML execution to prevent parent origin/DOM access', async () => {
  const mockSocket = {
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  };
  jest.spyOn(socketModule, 'initSocket').mockResolvedValue(mockSocket);

  const initialEntry = {
    pathname: '/editor/test-room',
    state: {
      username: 'TestUser',
      language: 'xml',
      languageName: 'HTML',
    },
  };

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </MemoryRouter>
  );

  const executeBtn = screen.getByText(/EXECUTE LINK/i);
  fireEvent.click(executeBtn);

  await waitFor(() => {
    const iframe = screen.getByTitle('preview');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    // Ensure allow-same-origin is NOT present, keeping the iframe in a unique sandboxed origin
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
    expect(iframe.getAttribute('sandbox')).not.toContain('allow-top-navigation');
  });
});
