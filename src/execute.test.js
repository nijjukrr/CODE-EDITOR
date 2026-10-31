const { app } = require('../server');
const http = require('http');

function makeRequest(app, payload) {
    return new Promise((resolve, reject) => {
        const server = http.createServer(app);
        server.listen(0, () => {
            const port = server.address().port;
            const data = JSON.stringify(payload);
            const req = http.request(
                {
                    hostname: '127.0.0.1',
                    port,
                    path: '/execute',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(data),
                    },
                },
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        server.close(() => {
                            try {
                                resolve({
                                    statusCode: res.statusCode,
                                    body: JSON.parse(body),
                                });
                            } catch (e) {
                                resolve({
                                    statusCode: res.statusCode,
                                    body,
                                });
                            }
                        });
                    });
                }
            );

            req.on('error', (err) => {
                server.close(() => reject(err));
            });

            req.write(data);
            req.end();
        });
    });
}

describe('POST /execute Security & Validation', () => {
    test('rejects requests with missing or invalid language', async () => {
        const res = await makeRequest(app, { code: 'console.log(1)' });
        expect(res.statusCode).toBe(400);
        expect(res.body.output).toMatch(/language must be a string/);
    });

    test('rejects requests with non-string code', async () => {
        const res = await makeRequest(app, { language: 'javascript', code: 12345 });
        expect(res.statusCode).toBe(400);
        expect(res.body.output).toMatch(/code must be a string/);
    });

    test('rejects payloads exceeding MAX_CODE_LENGTH (DoS protection)', async () => {
        const largeCode = 'a'.repeat(50001);
        const res = await makeRequest(app, { language: 'javascript', code: largeCode });
        expect(res.statusCode).toBe(413);
        expect(res.body.output).toMatch(/Payload too large/);
    });

    test('executes valid javascript code safely', async () => {
        const res = await makeRequest(app, { language: 'javascript', code: 'console.log("hello world");' });
        expect(res.statusCode).toBe(200);
        expect(res.body.output.trim()).toBe('hello world');
    });
});
