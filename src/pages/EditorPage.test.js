import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditorPage from './EditorPage';

// Mock Editor component because CodeMirror requires DOM layout APIs not present in JSDOM
jest.mock('../components/Editor', () => {
    return function MockEditor({ onCodeChange }) {
        return (
            <textarea
                data-testid="mock-editor"
                onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
            />
        );
    };
});

// Mock socket initialization
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
};

jest.mock('../socket', () => ({
    initSocket: () => Promise.resolve(mockSocket),
}));

describe('EditorPage Security Sandbox', () => {
    test('renders iframe with sandbox="allow-scripts" when previewing HTML', async () => {
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/editor/test-room',
                        state: {
                            username: 'testuser',
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

        // Click the EXECUTE LINK button to trigger HTML preview mode
        const executeButton = screen.getByText('EXECUTE LINK');
        fireEvent.click(executeButton);

        await waitFor(() => {
            const iframe = screen.getByTitle('preview');
            expect(iframe).toBeInTheDocument();
            // Verify security isolation: sandbox must contain allow-scripts and NOT allow-same-origin
            expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
        });
    });
});
