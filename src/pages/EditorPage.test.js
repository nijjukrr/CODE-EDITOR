import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditorPage from './EditorPage';
import * as socketModule from '../socket';

// Mock CodeMirror / Editor component since layout APIs are not implemented in JSDOM
jest.mock('../components/Editor', () => {
    return function MockEditor({ onCodeChange }) {
        return (
            <textarea
                data-testid="mock-editor"
                onChange={(e) => onCodeChange(e.target.value)}
            />
        );
    };
});

describe('EditorPage Security Tests', () => {
    let mockSocket;

    beforeEach(() => {
        mockSocket = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            disconnect: jest.fn(),
        };
        jest.spyOn(socketModule, 'initSocket').mockResolvedValue(mockSocket);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('renders HTML preview inside a sandboxed iframe without allow-same-origin', async () => {
        const initialEntry = {
            pathname: '/editor/room-123',
            state: {
                username: 'alice',
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

        // Click execute button to trigger preview render for HTML
        const executeButton = screen.getByText(/EXECUTE LINK/i);
        fireEvent.click(executeButton);

        await waitFor(() => {
            const iframe = screen.getByTitle('preview');
            expect(iframe).toBeInTheDocument();
            // Verify sandbox attribute is set securely to prevent parent window/cookie/localStorage access
            expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
            expect(iframe.getAttribute('sandbox')).not.toContain('allow-same-origin');
        });
    });
});
