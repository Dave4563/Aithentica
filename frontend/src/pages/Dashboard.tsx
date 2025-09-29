import { useEffect, useState, useRef } from "react";
import { sendChat, getChatHistory } from "../api/chat";
import { PolynationsImage } from "../api/vision"; 

interface ChatMessage {
  user_message: string;
  ai_response: string;
}

interface DashboardProps {
  accessToken: string;
  onRefresh: () => Promise<string | null>;
  onLogout: () => void;
}

const providers: Record<string, string[]> = {
  Polynations: ["Polynations"],
  Openai: ["gpt-5","gpt-5-mini","gpt-5-nano","gpt-4.1","gpt-4.1-mini","gpt-4.1-nano","gpt-4o","gpt-4o-mini","gpt-3.5-turbo",],
  Anthropic: ["claude-opus-4-1-20250805", "claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-3-5-haiku-20241022",],
  Deepseek: ["deepseek-chat", "deepseek-reasoner"],
  Groq: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  Gemini: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"],
};

// Vision models
const visionModels = ["flux"];

export default function Dashboard({
  onRefresh,
  onLogout,
}: DashboardProps) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "vision">("chat");

  // Chat states
  const [provider, setProvider] = useState("Polynations");
  const [model, setModel] = useState(providers["Polynations"][0]);

  // Vision states
  const [visionPrompt, setVisionPrompt] = useState("");
  const [visionModel, setVisionModel] = useState(visionModels[0]);
  const [visionImages, setVisionImages] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch chat history
  useEffect(() => {
    getChatHistory()
      .then((history) => {
        const formatted = history
          .sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
          .map((h: any) => ({
            user_message: h.question,
            ai_response: h.answer,
          }));
        setChat(formatted);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Handle Chat send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChat((prev) => [...prev, { user_message: message, ai_response: "" }]);
    setLoading(true);

    try {
      let res;
      try {
        res = await sendChat(message, provider, model);
      } catch (err: any) {
        if (err.response?.status === 401) {
          const newToken = await onRefresh();
          if (!newToken) throw new Error("Session expired");
          localStorage.setItem("accessToken", newToken)
          res = await sendChat(message, provider, model);
        } else throw err;
      }

      setChat((prev) => {
        const newChat = [...prev];
        newChat[newChat.length - 1].ai_response = res.text;
        return newChat;
      });
    } catch (err) {
      setChat((prev) => {
        const newChat = [...prev];
        newChat[newChat.length - 1].ai_response =
          "Error: could not fetch response";
        return newChat;
      });
      console.error(err);
    } finally {
      setMessage("");
      setLoading(false);
    }
  };

  // Handle Vision submit
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visionPrompt.trim()) return;

        setLoading(true);
    try {
        const res = await PolynationsImage({ prompt: visionPrompt, model: visionModel, width: 1024, height: 1024 });
        setVisionImages(prev => [...prev, res.image_url]);
    } catch (err: any) {
        if (err.response?.status === 401) {
            const newToken = await onRefresh();
            if (!newToken) throw new Error("Session expired");
            localStorage.setItem("accessToken", newToken);

            // Retry once with new token
            const res = await PolynationsImage({ prompt: visionPrompt, model: visionModel, width: 1024, height: 1024 });
            setVisionImages(prev => [...prev, res.image_url]);
        } else {
            console.error("Vision error:", err);
            throw err;
            }
    } finally {
        setVisionPrompt("");
        setLoading(false);
    }
  };




  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col gap-4">
        <h2 className="text-lg font-bold mb-2">Options</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 p-2 rounded ${
              activeTab === "chat" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("vision")}
            className={`flex-1 p-2 rounded ${
              activeTab === "vision" ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            Vision
          </button>
        </div>

        {/* Chat options */}
        {activeTab === "chat" && (
          <>
            <label>
              Provider
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value;
                  setProvider(p);
                  setModel(providers[p][0]);
                }}
                className="w-full mt-1 p-1 rounded bg-gray-700 text-white"
              >
                {Object.keys(providers).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Model
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full mt-1 p-1 rounded bg-gray-700 text-white"
              >
                {providers[provider].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        {/* Vision options */}
        {activeTab === "vision" && (
        <>
            {/* Provider dropdown (Polynations visible) */}
            <label className="block">
            Provider
            <select
                value="Polynations"
                className="w-full mt-1 p-1 rounded bg-gray-700 text-white"
            >
                <option value="Polynations">Polynations</option>
            </select>
            </label>

            {/* Model dropdown */}
            <label className="block gap-4">
            Model
            <select
                value={visionModel}
                onChange={(e) => setVisionModel(e.target.value)}
                className="w-full mt-1 p-1 rounded bg-gray-700 text-white"
            >
                {visionModels.map((m) => (
                <option key={m} value={m}>
                    {m}
                </option>
                ))}
            </select>
            </label>
        </>
        )}


        {/* Logout */}
        <button
          onClick={onLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white p-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col p-4">
        {activeTab === "chat" && (
          <>
            <h1 className="text-2xl mb-4">Chat with AI</h1>
            <div className="flex-1 border border-gray-700 rounded p-4 overflow-y-auto mb-4 bg-gray-950">
              {chat.length === 0 && (
                <p className="text-gray-400">Start chatting...</p>
              )}
              {chat.map((c, i) => (
                <div key={i} className="mb-4 flex flex-col w-full">
                  <div className="flex justify-end w-full">
                    <div className="bg-blue-600 p-2 rounded-l-lg rounded-br-lg max-w-[70%] break-words">
                      {c.user_message}
                    </div>
                  </div>
                  <div className="flex justify-start w-full mt-1">
                    <div className="bg-gray-700 p-2 rounded-r-lg rounded-bl-lg max-w-[70%] break-words">
                      {c.ai_response ||
                        (loading && i === chat.length - 1
                          ? "AI is typing..."
                          : "")}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                className="bg-blue-600 px-4 rounded disabled:opacity-50"
                disabled={loading}
              >
                Send
              </button>
            </form>
          </>
        )}

        {activeTab === "vision" && (
          <>
            <h1 className="text-2xl mb-4">Generate Images</h1>
            <div className="flex-1 border border-gray-700 rounded p-4 overflow-y-auto mb-4 bg-gray-950">
              {visionImages.length === 0 && (
                <p className="text-gray-400">No images generated yet...</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {visionImages.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Generated"
                    className="rounded-lg border border-gray-700"
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerateImage} className="flex gap-2">
              <input
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500"
                value={visionPrompt}
                onChange={(e) => setVisionPrompt(e.target.value)}
                placeholder="Describe the image you want..."
              />
              <button
                type="submit"
                className="bg-green-600 px-4 rounded disabled:opacity-50"
                disabled={loading}
              >
                Generate
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
