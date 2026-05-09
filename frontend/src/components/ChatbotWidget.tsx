import { useState } from "react";

import { chat } from "../services/aiService";
import { addToCart, getCart } from "../services/cartService";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import useToastStore from "../stores/toastStore";
import { ChatResponse } from "../types/models";

const quickPrompts = [
  "Tư vấn laptop gaming dưới 15 triệu",
  "Điện thoại pin trâu",
  "Phụ kiện bán chạy",
  "Chính sách đổi trả"
];

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  payload?: ChatResponse;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setCart = useCartStore((state) => state.setCart);
  const toast = useToastStore((state) => state.push);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: ChatMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const response = await chat({ query: text, user_id: user?.id });
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response.answer, payload: response }
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "AI tam thoi chua tra loi duoc. Vui long thu lai sau it phut."
        }
      ]);
      toast("AI service dang loi hoac chua san sang", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (productId: number) => {
    await addToCart(productId, 1);
    const cart = await getCart();
    setCart(cart);
    toast("Đã thêm vào giỏ hàng", "success");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Assistant</div>
              <div className="font-semibold">TechStore AI Desk</div>
            </div>
            <button className="btn-ghost" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <div className="chat-suggestions">
            {quickPrompts.map((prompt) => (
              <button key={prompt} className="chip chip-muted" onClick={() => handleSend(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          <div className="chat-body">
            {messages.map((message, index) => (
              <div key={index} className={message.role === "user" ? "text-right" : "text-left"}>
                <div className={message.role === "user" ? "bubble user" : "bubble bot"}>{message.text}</div>
                {message.payload?.sources && message.payload.sources.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 space-y-1">
                    {message.payload.sources.map((source) => (
                      <div key={source.id}>Source: {source.title}</div>
                    ))}
                  </div>
                )}
                {message.payload?.products && (
                  <div className="mt-2 space-y-2">
                    {message.payload.products.map((product) => (
                      <div key={product.id} className="chat-product">
                        <div>
                          <div className="font-semibold text-sm">{product.name}</div>
                          <div className="text-xs text-slate-500">${product.price}</div>
                        </div>
                        <button className="btn-secondary" onClick={() => handleAdd(product.id)}>
                          Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500">Đang trả lời...</div>}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend(query);
            }}
            className="chat-input"
          >
            <input
              className="input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nhập câu hỏi..."
            />
            <button className="btn-primary" type="submit">
              Gửi
            </button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((prev) => !prev)}>
        {open ? "×" : "AI"}
      </button>
    </div>
  );
}
