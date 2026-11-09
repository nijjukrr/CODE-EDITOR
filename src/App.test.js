import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import EditorPage from './pages/EditorPage';
import * as socketModule from './socket';

// Mock Editor component because CodeMirror requires DOM measurement APIs not supported in JSDOM
jest.mock('./components/Editor', () => {
  return function MockEditor({ onCodeChange }) {
    return (
      <textarea
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

test('renders sandboxed iframe for HTML/XML preview in EditorPage', async () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  jest.spyOn(socketModule, 'initSocket').mockResolvedValue(mockSocket);

  await act(async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/editor/test-room',
            state: {
              username: 'CyberDev',
              language: 'xml',
              languageName: 'HTML',
            },
          },
        ]}
      >
        <Routes>
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </MemoryRouter>
    );
  });

  const executeBtn = screen.getByText('EXECUTE LINK');
  await act(async () => {
    fireEvent.click(executeBtn);
  });

  const previewIframe = screen.getByTitle('preview');
  expect(previewIframe).toBeInTheDocument();
  // Ensure sandbox attribute isolates iframe scripts from parent origin
  expect(previewIframe).toHaveAttribute('sandbox', 'allow-scripts');
});
