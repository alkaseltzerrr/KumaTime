import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

// Avoid DNS result reordering that can cause localhost/WS issues on Windows/Firefox
// See: https://vitejs.dev/config/server-options.html#server-hmr
// and Node's dns.setDefaultResultOrder('verbatim') recommendation
// Forces Vite to bind/resolve consistently
// eslint-disable-next-line n/no-unsupported-features/node-builtins
dns.setDefaultResultOrder('verbatim')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Force IPv4 localhost and ensure a stable port
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // Make HMR websocket use the same host/port explicitly
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
      clientPort: 5173,
    },
  },
})
