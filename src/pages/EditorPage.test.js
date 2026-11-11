import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditorPage from './EditorPage';
import * as socketModule from '../socket';

// Mock Editor component because CodeMirror requires browser layout APIs not present in JSDOM
jest.mock('../components/Editor', () => {
    return function DummyEditor({ onCodeChange }) {
        return (
            <textarea
                data-testid="mock-editor"
                onChange={(e) => onCodeChange && onCodeChange(e.target.value)}
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

    test('renders HTML preview iframe with sandbox="allow-scripts" to isolate untrusted code', async () => {
        const testCode = '<h1>Untrusted Code</h1><script>alert(window.parent.location)</script>';

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

        // Enter code into the mock editor
        const editorTextarea = screen.getByTestId('mock-editor');
        fireEvent.change(editorTextarea, { target: { value: testCode } });

        // Trigger execution / preview
        const runButton = screen.getByRole('button', { name: /EXECUTE LINK/i });
        fireEvent.click(runButton);

        // Verify iframe rendering and sandbox attribute
        await waitFor(() => {
            const iframe = screen.getByTitle('preview');
            expect(iframe).toBeInTheDocument();
            expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
            expect(iframe).toHaveAttribute('srcdoc', testCode);
        });
    });
});
