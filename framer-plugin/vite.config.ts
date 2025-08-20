import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    open: false,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.tsx"),
      name: "AltTextGenerator",
      fileName: "plugin",
      formats: ["es"]
    },
    rollupOptions: {
      external: ["react", "react-dom", "framer-plugin"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "framer-plugin": "framer"
        }
      }
    }
  },
  define: {
    "process.env": {}
  }
})