import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock Editor component directly to avoid codemirror mode imports
jest.mock('../components/Editor', () => {
    const ReactInside = require('react');
    return function MockEditor({ onCodeChange }) {
        ReactInside.useEffect(() => {
            onCodeChange('<h1>Sandboxed Preview</h1>');
        }, [onCodeChange]);
        return ReactInside.createElement('div', { 'data-testid': 'mock-editor' });
    };
});

// Mock socket module
jest.mock('../socket', () => ({
    initSocket: () =>
        Promise.resolve({
            on: jest.fn(),
            emit: jest.fn(),
            off: jest.fn(),
            disconnect: jest.fn(),
        }),
}));

import EditorPage from './EditorPage';

describe('EditorPage Security Tests', () => {
    test('renders HTML preview with sandbox="allow-scripts" attribute', async () => {
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/editor/test-room',
                        state: {
                            username: 'TestUser',
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

        // Click execute button to trigger preview
        const executeButton = screen.getByText(/EXECUTE LINK/i);
        fireEvent.click(executeButton);

        // Verify the preview iframe is rendered and properly sandboxed
        const iframe = await screen.findByTitle('preview');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    });
});
