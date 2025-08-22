import { MAHJONG_CLASS_IDS, MAHJONG_TILES } from "@/types/game";
import * as ort from "onnxruntime-web";
import { useCallback, useEffect, useRef, useState } from "react";

// URL do modelo ONNX.
const MODEL_URL = "./best.onnx";

// Constantes de detecção
const INPUT_DIM = 640;
const CONFIDENCE_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;

/**
 * Redimensiona a imagem e cria um tensor de entrada para o modelo ONNX.
 */
const preprocessImage = (imageElement) => {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = INPUT_DIM;
  tempCanvas.height = INPUT_DIM;
  tempCtx.drawImage(imageElement, 0, 0, INPUT_DIM, INPUT_DIM);

  const imageData = tempCtx.getImageData(0, 0, INPUT_DIM, INPUT_DIM).data;
  const float32Data = new Float32Array(INPUT_DIM * INPUT_DIM * 3);
  let offset = 0;

  for (let c = 0; c < 3; ++c) {
    for (let i = 0; i < imageData.length; i += 4) {
      float32Data[offset++] = imageData[i + c] / 255.0;
    }
  }

  return new ort.Tensor("float32", float32Data, [1, 3, INPUT_DIM, INPUT_DIM]);
};

/**
 * Aplica o algoritmo Non-Maximum Suppression para remover caixas sobrepostas.
 */
const nms = (boxes, scores, iouThreshold) => {
  const indices = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score)
    .map((detection) => detection.index);

  const selectedIndices = [];
  while (indices.length > 0) {
    const current = indices.shift();
    selectedIndices.push(current);
    const currentBox = boxes[current];
    const remaining = [];
    for (let i = 0; i < indices.length; i++) {
      const otherBox = boxes[indices[i]];
      const intersectionX = Math.max(currentBox[0], otherBox[0]);
      const intersectionY = Math.max(currentBox[1], otherBox[1]);
      const intersectionWidth =
        Math.min(currentBox[2], otherBox[2]) - intersectionX;
      const intersectionHeight =
        Math.min(currentBox[3], otherBox[3]) - intersectionY;

      if (intersectionWidth > 0 && intersectionHeight > 0) {
        const intersectionArea = intersectionWidth * intersectionHeight;
        const unionArea =
          (currentBox[2] - currentBox[0]) * (currentBox[3] - currentBox[1]) +
          (otherBox[2] - otherBox[0]) * (otherBox[3] - otherBox[1]) -
          intersectionArea;

        const iou = intersectionArea / unionArea;
        if (iou < iouThreshold) {
          remaining.push(indices[i]);
        }
      } else {
        remaining.push(indices[i]);
      }
    }
    indices.splice(0, indices.length, ...remaining);
  }
  return selectedIndices;
};

// The custom hook
const useMahjongDetection = () => {
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    // This effect runs only once to load the model
    const loadModel = async () => {
      try {
        ort.env.wasm.proxy = "ort/ort-wasm-simd-threaded.js";

        const providers = ["webgpu", "wasm", "cpu"];
        const newSession = await ort.InferenceSession.create(MODEL_URL, {
          executionProviders: providers,
        });
        sessionRef.current = newSession;
        console.log("ONNX Model loaded successfully.");
        setIsModelLoading(false);
      } catch (error) {
        console.error("Failed to load the ONNX model:", error);
        setModelError(error);
        setIsModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const runDetection = useCallback(
    async (imageElement) => {
      if (isModelLoading) {
        throw new Error("Model is still loading. Please wait.");
      }
      if (modelError) {
        throw new Error("Model failed to load.");
      }
      if (!sessionRef.current) {
        throw new Error("Model is not ready. Is the model loaded correctly?");
      }
      if (!imageElement) {
        throw new Error("Image element is not ready.");
      }

      try {
        const inputTensor = preprocessImage(imageElement);
        const feeds = { images: inputTensor };
        const results = await sessionRef.current.run(feeds);
        const outputTensor = results[Object.keys(results)[0]];
        const outputData = outputTensor.data;

        let rows, cols;
        if (outputTensor.dims[1] > outputTensor.dims[2]) {
          rows = outputTensor.dims[1];
          cols = outputTensor.dims[2];
        } else {
          rows = outputTensor.dims[2];
          cols = outputTensor.dims[1];
        }

        const detections = [];
        const boxes = [];
        const scores = [];

        for (let i = 0; i < rows; i++) {
          let row;
          if (outputTensor.dims[1] > outputTensor.dims[2]) {
            row = outputData.subarray(i * cols, (i + 1) * cols);
          } else {
            row = new Float32Array(cols);
            for (let j = 0; j < cols; j++) {
              row[j] = outputData[j * rows + i];
            }
          }

          const [x, y, w, h] = row.slice(0, 4);
          const classScores = row.slice(4);
          const maxScore = Math.max(...classScores);
          const classId = classScores.indexOf(maxScore);

          if (maxScore > CONFIDENCE_THRESHOLD) {
            const x1 = x - w / 2;
            const y1 = y - h / 2;
            const x2 = x + w / 2;
            const y2 = y + h / 2;

            boxes.push([x1, y1, x2, y2]);
            scores.push(maxScore);
            detections.push({
              box: [x1, y1, x2, y2],
              score: maxScore,
              classId: classId,
            });
          }
        }

        const selectedIndices = nms(boxes, scores, IOU_THRESHOLD);

        const finalDetections = selectedIndices.map((index) => {
          const detection = detections[index];
          const tileId = MAHJONG_CLASS_IDS[detection.classId];
          const tileData = MAHJONG_TILES[tileId];

          return {
            tileCode: tileId,
            tileName: tileData?.display || tileId,
            confidence: (detection.score * 100).toFixed(2),
          };
        });

        console.log(
          `Detected ${finalDetections.length} tiles after NMS.`,
          finalDetections
        );
        return finalDetections.length > 0 ? finalDetections : null;
      } catch (error) {
        console.error("Image processing error:", error);
        throw error;
      }
    },
    [isModelLoading, modelError]
  );

  return { runDetection, isModelLoading, modelError };
};

export default useMahjongDetection;
