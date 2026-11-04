import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditorPage from './EditorPage';

const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
};

// Mock socket module to prevent network attempts
jest.mock('../socket', () => ({
    initSocket: () => Promise.resolve(mockSocket),
}));

// Mock CodeMirror Editor component
jest.mock('../components/Editor', () => {
    return function MockEditor() {
        return <div data-testid="mock-editor">Editor</div>;
    };
});

describe('EditorPage Security Sandbox', () => {
    test('renders HTML preview with sandbox attribute to mitigate XSS', async () => {
        const initialEntries = [
            {
                pathname: '/editor/test-room',
                state: {
                    username: 'Tester',
                    language: 'xml',
                    languageName: 'HTML',
                },
            },
        ];

        render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </MemoryRouter>
        );

        // Click execute button to trigger preview rendering for HTML
        const executeButton = screen.getByText(/EXECUTE LINK/i);
        fireEvent.click(executeButton);

        // The preview iframe should be rendered
        const iframe = await screen.findByTitle('preview');
        expect(iframe).toBeInTheDocument();
        // Verify strict sandbox attribute is present and has no dangerous permissions
        expect(iframe).toHaveAttribute('sandbox', '');
    });
});
