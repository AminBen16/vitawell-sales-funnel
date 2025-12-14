const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Proxy API requests to port 5000
app.use('/api', (req, res) => {
    const targetUrl = `http://localhost:5000${req.originalUrl}`;
    
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(502).json({ error: 'Bad Gateway' });
    });
    
    req.pipe(proxyReq);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog-frontend-optimized.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ VitaBlog Frontend running on http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser\n`);
});
