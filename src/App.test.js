import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import EditorPage from './pages/EditorPage';

test('renders enter matrix header', () => {
  render(<App />);
  const headingElement = screen.getByText(/Enter Matrix/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders preview iframe with sandbox attribute in EditorPage', async () => {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/editor/test-room', state: { username: 'testuser', languageName: 'HTML', language: 'xml' } }]}>
      <Routes>
        <Route path="/editor/:roomId" element={<EditorPage />} />
      </Routes>
    </MemoryRouter>
  );

  const executeBtn = screen.getByText(/EXECUTE LINK/i);
  fireEvent.click(executeBtn);

  const iframe = screen.getByTitle('preview');
  expect(iframe).toBeInTheDocument();
  expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
});
