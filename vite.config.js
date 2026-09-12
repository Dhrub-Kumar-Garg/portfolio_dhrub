import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server) {
    // Load env variables into process.env to simulate Vercel serverless environment locally
    Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), ''));

    server.middlewares.use('/api/codolio', async (req, res) => {
      try {
        // Map request paths to api files
        let apiModulePath = '';
        if (req.originalUrl.startsWith('/api/codolio')) apiModulePath = './api/codolio.js';
        if (req.originalUrl.startsWith('/api/contact')) apiModulePath = './api/contact.js';
        
        if (!apiModulePath) return;

        const api = await import(apiModulePath);
        // Vercel handlers expect a specific req/res signature.
        // We'll mock the minimal required properties that the handler uses.
        // It sets headers, status, and sends json.
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        
        await api.default(req, res);
      } catch (err) {
        console.error('Local API Error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Local API server error' }));
      }
    });

    server.middlewares.use('/api/contact', async (req, res) => {
      try {
        const api = await import('./api/contact.js');
        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
        await api.default(req, res);
      } catch (err) {
        console.error('Local API Error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Local API server error' }));
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
})
