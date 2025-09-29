import axiosInstance from "./axiosConfig";

export const getChatHistory = async () => {
  const { data } = await axiosInstance.get("/gen_ai_models/chat_history/");
  return data;
};

export const sendChat = async (
  message: string,
//   token: string,
  provider: string,
  model: string
) => {
  if (provider === "Polynations") {
    const { data } = await axiosInstance.post(
      "/gen_ai_models/chat_pollinations/",
      { prompt: message },
    //   { headers: { Authorization: `Bearer ${token}` } }
    );
    return data;
  } 
  else {
    const { data } = await axiosInstance.post(
        "/gen_ai_models/chat/",
        {
        provider: provider, 
        model,
        system_prompt: "You are a helpful assistant.",
        user_prompt: message,
        },
        // { headers: { Authorization: `Bearer ${token}` } }
    );
    return {"text": data["content"]};
  }
};



