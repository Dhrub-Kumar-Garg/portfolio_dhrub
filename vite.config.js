import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple Vite plugin to serve our Vercel API route locally
const vercelApiPlugin = () => ({
  name: 'vercel-api-plugin',
  configureServer(server) {
    server.middlewares.use('/api/codolio', async (req, res) => {
      try {
        // dynamic import the api file
        const api = await import('./api/codolio.js');
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
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vercelApiPlugin()],
})
