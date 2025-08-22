import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const base = isProduction ? './' : '/';

  return {
    server: {
      host: "::",
      port: 8090,
    },
      build: {
    chunkSizeWarningLimit: 1000 // Set to 1000 kB (1 MB)
  },
    assetsInclude: ["**/*.onnx"],
    optimizeDeps: {
      exclude: ["onnxruntime-web"],
    },
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          { src: 'node_modules/onnxruntime-web/dist/*', dest: 'ort' }, { 
            src: 'src/model/yollo8/weights/best.onnx',
            dest: '.'
          }] }),
    ].filter(Boolean),
    base: base, // Use the conditional base URL here
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});