"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import "./ChatBot.css";

interface RoomResult {
  _id: string;
  name: string;
  pricePerNight: number;
  guestCapacity: number;
  category: string;
  isInternet: boolean;
  isBreakfast: boolean;
  isAirConditioned: boolean;
  ratings: number;
  images: { url: string }[];
  address: string;
}

interface Message {
  role: "bot" | "user";
  text: string;
  rooms?: RoomResult[];
}

const SUGGESTIONS = [
  "Phòng có wifi giá rẻ",
  "Phòng King có điều hòa",
  "Phòng đôi có bữa sáng",
  "Phòng cho phép thú cưng",
  "Phòng tốt nhất hiện tại",
];

const WELCOME: Message = {
  role: "bot",
  text: "Xin chào! 👋 Tôi là trợ lý AI của BookRoom.\nHãy mô tả phòng bạn muốn — vị trí, giá cả, tiện nghi — tôi sẽ tìm ngay cho bạn!",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleOpen = () => {
    setOpen(true);
    setShowBadge(false);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "❌ Lỗi: " + data.error },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: data.reply,
            rooms: data.rooms?.length > 0 ? data.rooms : undefined,
          },
        ]);
        if (data.rooms?.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              text: "😔 Rất tiếc, không tìm thấy phòng phù hợp. Hãy thử tiêu chí khác nhé!",
            },
          ]);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "❌ Không kết nối được server. Vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button className="chatbot-fab" onClick={handleOpen} aria-label="Mở chatbot">
        {showBadge && <span className="chatbot-fab-badge" />}
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">🤖</div>
            <div className="chatbot-header-info">
              <div className="chatbot-header-name">BookRoom AI</div>
              <div className="chatbot-header-status">● Trực tuyến – Tìm phòng thông minh</div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx}>
                <div className={`chat-bubble ${msg.role}`} style={{ whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </div>
                {msg.rooms && msg.rooms.length > 0 && (
                  <div className="chatbot-rooms">
                    {msg.rooms.map((room) => {
                      const features = [];
                      if (room.isInternet) features.push("WiFi");
                      if (room.isBreakfast) features.push("Bữa sáng");
                      if (room.isAirConditioned) features.push("Điều hòa");
                      return (
                        <Link
                          key={room._id}
                          href={`/rooms/${room._id}`}
                          className="chatbot-room-card"
                          onClick={() => setOpen(false)}
                        >
                          <img
                            className="chatbot-room-img"
                            src={room.images?.[0]?.url || "/images/default_room_image.jpg"}
                            alt={room.name}
                          />
                          <div className="chatbot-room-info">
                            <div className="chatbot-room-name">{room.name}</div>
                            <div className="chatbot-room-price">
                              {room.pricePerNight.toLocaleString("vi-VN")} VND / đêm
                            </div>
                            {features.length > 0 && (
                              <div className="chatbot-room-features">
                                {features.map((f) => (
                                  <span key={f} className="chatbot-feature-tag">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="chatbot-view-btn">Xem</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble bot">
                <span className="typing-dots">
                  <span /><span /><span />
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="chatbot-suggestion-chip"
                onClick={() => sendMessage(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Nhập yêu cầu của bạn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <svg viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
