import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import * as socketModule from '../socket';

jest.mock('../components/Editor', () => {
    return function MockEditor({ onCodeChange }) {
        return (
            <div data-testid="mock-editor">
                <button
                    onClick={() => onCodeChange('<h1>Hello World</h1><script>window.parent.location="evil.com"</script>')}
                >
                    Set Code
                </button>
            </div>
        );
    };
});

import EditorPage from './EditorPage';

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

    test('renders HTML preview iframe with secure sandbox="allow-scripts"', async () => {
        await act(async () => {
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
        });

        // Simulate code entry
        const setCodeBtn = screen.getByText('Set Code');
        fireEvent.click(setCodeBtn);

        // Click execute link to trigger preview
        const executeBtn = screen.getByText('EXECUTE LINK');
        fireEvent.click(executeBtn);

        // Find the preview iframe
        const iframe = screen.getByTitle('preview');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('sandbox', 'allow-scripts');
    });
});
