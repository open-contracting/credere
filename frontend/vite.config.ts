import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 3000,
      host: process.env.VITE_HOST ?? "localhost",
    },
    plugins: [
      react(),
      tailwindcss(),
      checker({
        typescript: true,
      }),
    ],
  });
};
