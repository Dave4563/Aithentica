import axiosInstance from "./axiosConfig";

interface PolynationsImageRequest {
  prompt: string;
  model: string;
  width: number;
  height: number;
  seed?: number; // optional
}

export const PolynationsImage = async (params: PolynationsImageRequest) => {
  const { data } = await axiosInstance.post(
    "/gen_ai_models/vision/",
    {
      prompt: params.prompt,
      model: params.model,
      width: params.width,
      height: params.height,
      seed: params.seed ?? Math.floor(Math.random() * 100000), // fallback seed
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return data;
};
