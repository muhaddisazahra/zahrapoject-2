
"use client";

import { useEffect, useRef, useState } from "react";
import rules from "../rules.json";
import IntakeForm from "./IntakeForm";
import type { ProjectSubmission } from "../lib/storage";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const knowledgeBase = rules as Rule[];

const quickTopics = [
  "Explore Services",
  "Pricing",
  "Project Timeline",
  "Start a Project",
  "How It Works",
  "Contact",
];

function matchesKeyword(message: string, keyword: string) {
  const escaped = keyword.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!escaped) return false;

  const pattern = new RegExp(`(^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i");
  return pattern.test(message);
}

function findReply(message: string) {
  const normalized = message.toLowerCase().trim();

  const matchedRule = knowledgeBase.find((rule) =>
    rule.keywords.some((keyword) => matchesKeyword(normalized, keyword))
  );

  return matchedRule?.reply ??
    "I'm not sure I understood that question. You can ask me about our services, pricing, project timelines or onboarding. You can also select Start a Project to prepare your project brief.";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hello! Welcome to Nexa Digital Studio.\n\nI'm your OnboardFlow assistant. I can help you explore our services, understand the project process and prepare a professional project brief.\n\nHow can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [completed, setCompleted] = useState<ProjectSubmission | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, showIntake, completed]);

  function openIntake() {
    setCompleted(null);
    setShowIntake(true);
    setMessages((old) => [
      ...old,
      {
        id: ++messageId.current,
        sender: "bot",
        text: "Excellent! Let's prepare your project brief. Please complete the guided questions below. You can review and edit your answers before submission.",
      },
    ]);
  }

  function sendMessage(text: string) {
    const message = text.trim();
    if (!message || typing) return;

    setInput("");

    const userMessage: Message = {
      id: ++messageId.current,
      sender: "user",
      text: message,
    };

    setMessages((old) => [...old, userMessage]);

    const normalized = message.toLowerCase();

    if (
      normalized.includes("start a project") ||
      normalized.includes("start project") ||
      normalized.includes("get started")
    ) {
      setTyping(true);
      window.setTimeout(() => {
        setTyping(false);
        openIntake();
      }, 550);
      return;
    }

    const reply = findReply(message);

    setTyping(true);
    window.setTimeout(() => {
      setMessages((old) => [
        ...old,
        {
          id: ++messageId.current,
          sender: "bot",
          text: reply,
        },
      ]);
      setTyping(false);
    }, 600);
  }

  function handleComplete(submission: ProjectSubmission) {
    setShowIntake(false);
    setCompleted(submission);

    setMessages((old) => [
      ...old,
      {
        id: ++messageId.current,
        sender: "bot",
        text: `Your project brief has been generated successfully!\n\nReference: ${submission.id}\n\nYour information has been saved in this browser's local storage. This is a demonstration only; no email or real agency request has been sent.`,
      },
    ]);
  }

  async function copyBrief() {
    if (!completed) return;

    try {
      await navigator.clipboard.writeText(completed.brief);
      alert("Project brief copied successfully!");
    } catch {
      alert("Clipboard access is unavailable in this browser.");
    }
  }

  return (
    <section className="workspace">
      <header className="workspace-header">
        <a href="/" className="studio-brand">
          <div className="brand-mark">N</div>
          <div>
            <strong>Nexa Digital Studio</strong>
            <span>ONBOARDFLOW PLATFORM</span>
          </div>
        </a>

        <div className="header-actions">
          <a className="admin-link" href="/admin">Admin dashboard ↗</a>
          <div className="online-pill"><i /> Demo assistant</div>
        </div>
      </header>

      <div className="chat-layout">
        <aside className="welcome-panel">
          <span className="eyebrow">SMART CLIENT EXPERIENCE</span>
          <h1>Better projects start with <span>better conversations.</span></h1>
          <p>
            A smarter way to discover services, communicate project needs
            and turn ideas into structured project briefs.
          </p>

          <div className="feature-list">
            <div><span>01</span><p>Explore digital services</p></div>
            <div><span>02</span><p>Share your project goals</p></div>
            <div><span>03</span><p>Generate a structured brief</p></div>
          </div>

          <div className="side-note">
            <div className="note-icon">✦</div>
            <div>
              <strong>Make your next step simpler</strong>
              <p>Answer guided questions instead of writing a long, unstructured inquiry.</p>
            </div>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-heading">
            <div className="assistant-avatar">N</div>
            <div>
              <strong>OnboardFlow Assistant</strong>
              <span><i /> Available for demo conversations</span>
            </div>
            <span className="secure-label">DEMO MODE</span>
          </div>

          <div className="chat-messages">
            <div className="date-divider"><span>YOUR PROJECT STARTS HERE</span></div>

            {messages.map((message) => (
              <div className={`message-row ${message.sender}`} key={message.id}>
                {message.sender === "bot" && <div className="message-avatar">N</div>}
                <div className="message-content">
                  <span className="message-label">
                    {message.sender === "bot" ? "ONBOARDFLOW ASSISTANT" : "YOU"}
                  </span>
                  <div className="message-bubble">{message.text}</div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="message-row">
                <div className="message-avatar">N</div>
                <div className="message-content">
                  <span className="message-label">ONBOARDFLOW ASSISTANT</span>
                  <div className="typing-bubble"><i /><i /><i /></div>
                </div>
              </div>
            )}

            {showIntake && (
              <IntakeForm
                onComplete={handleComplete}
                onClose={() => setShowIntake(false)}
              />
            )}

            {completed && (
              <div className="completion-card">
                <div className="success-icon">✓</div>
                <div>
                  <strong>Project brief ready!</strong>
                  <p>Reference: {completed.id}. Your demo submission is saved locally.</p>
                </div>
                <button onClick={copyBrief}>Copy brief</button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="chat-bottom">
            <div className="quick-heading">SUGGESTED TOPICS</div>

            <div className="quick-topics">
              {quickTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() =>
                    topic === "Start a Project"
                      ? openIntake()
                      : sendMessage(topic === "Explore Services" ? "What services do you offer?" :
                        topic === "Project Timeline" ? "What is your project timeline?" :
                        topic === "How It Works" ? "How does the project process work?" :
                        topic)
                  }
                  disabled={typing}
                >
                  {topic}
                </button>
              ))}
            </div>

            <form
              className="chat-input-area"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services, pricing or your project..."
                aria-label="Your message"
              />
              <button type="submit" disabled={!input.trim() || typing}>
                Send <span>➤</span>
              </button>
            </form>

            <p className="chat-footnote">
              OnboardFlow is a rule-based demonstration. No AI API or real agency connection.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
