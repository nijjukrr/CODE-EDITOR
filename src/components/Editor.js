import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/php/php';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/go/go';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/shell/shell';
import 'codemirror/mode/r/r';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange, language }) => {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: language || 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const socket = socketRef.current;
        if (socket) {
            socket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            if (socket) {
                socket.off(ACTIONS.CODE_CHANGE);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
