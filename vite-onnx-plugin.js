// vite-plugin-onnx-assets.js
import { cp, mkdir, readdir } from "fs/promises";
import { join, resolve } from "path";

const onnxAssetsPlugin = () => {
  return {
    name: "vite-plugin-onnx-assets",
    // 'buildStart' runs before the build process begins
    async buildStart() {
      const sourceDir = resolve("node_modules/onnxruntime-web/dist");
      const outputDir = resolve("public/onnx-assets");

      try {
        await mkdir(outputDir, { recursive: true });
        const files = await readdir(sourceDir);

        for (const file of files) {
          await cp(join(sourceDir, file), join(outputDir, file));
        }
        console.log("ONNX Runtime Web assets copied successfully.");
      } catch (err) {
        console.error("Failed to copy ONNX assets:", err);
      }
    },
  };
};

export default onnxAssetsPlugin;
