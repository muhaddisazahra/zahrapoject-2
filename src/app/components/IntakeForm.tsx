
"use client";

import { useState } from "react";
import { saveSubmission } from "../lib/storage";
import type { ProjectSubmission } from "../lib/storage";

type Answers = {
  name: string;
  email: string;
  company: string;
  service: string;
  description: string;
  audience: string;
  budget: string;
  timeframe: string;
  additional: string;
};

const initialAnswers: Answers = {
  name: "",
  email: "",
  company: "",
  service: "",
  description: "",
  audience: "",
  budget: "",
  timeframe: "",
  additional: "",
};

const questions = [
  { key: "name", title: "What should we call you?", help: "Enter your full name.", type: "text" },
  { key: "email", title: "What's your email address?", help: "We'll use this as the contact detail in your brief.", type: "email" },
  { key: "company", title: "What's your business or company name?", help: "You can enter your brand name or write Individual.", type: "text" },
  { key: "service", title: "Which service do you need?", help: "Choose the service that best describes your project.", type: "select" },
  { key: "description", title: "Tell us about your project.", help: "Explain what you want to build or achieve.", type: "textarea" },
  { key: "audience", title: "Who is your target audience?", help: "For example: online shoppers, students, small businesses.", type: "text" },
  { key: "budget", title: "What's your estimated budget?", help: "This is an indicative budget, not a quotation.", type: "select" },
  { key: "timeframe", title: "When would you like the project completed?", help: "Choose your preferred timeframe.", type: "select" },
  { key: "additional", title: "Any additional requirements?", help: "This question is optional.", type: "textarea" },
] as const;

const services = [
  "Website Development",
  "E-commerce Development",
  "UI/UX Design",
  "Graphic Design",
  "SEO Services",
  "Social Media Management",
  "Website Maintenance",
  "Not sure yet",
];

const budgets = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $3,000",
  "$3,000 – $5,000",
  "$5,000+",
  "Not decided",
];

const timeframes = [
  "Within 2 weeks",
  "Within 1 month",
  "Within 2–3 months",
  "Within 6 months",
  "Flexible",
];

interface Props {
  onComplete: (submission: ProjectSubmission) => void;
  onClose: () => void;
}

export default function IntakeForm({ onComplete, onClose }: Props) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");

  const current = questions[step];
  const value = answers[current.key as keyof Answers];

  function update(value: string) {
    setAnswers((old) => ({ ...old, [current.key]: value }));
    setError("");
  }

  function next() {
    const currentValue = value.trim();

    if (current.key !== "additional" && !currentValue) {
      setError("Please complete this required field.");
      return;
    }

    if (
      current.key === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue)
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setReview(true);
    }
  }

  function generateBrief(): string {
    return `PROJECT BRIEF
Nexa Digital Studio | OnboardFlow

CLIENT INFORMATION
Name: ${answers.name}
Email: ${answers.email}
Business: ${answers.company}

PROJECT DETAILS
Selected Service: ${answers.service}
Project Description:
${answers.description}

Target Audience: ${answers.audience}
Estimated Budget: ${answers.budget}
Preferred Timeline: ${answers.timeframe}

ADDITIONAL REQUIREMENTS
${answers.additional || "Not provided"}

NEXT STEPS
1. Review the submitted requirements.
2. Discuss project scope and expectations.
3. Prepare a suitable quotation and project proposal.
4. Agree on terms before beginning work.

Generated: ${new Date().toLocaleString()}

Note: This is a demonstration project brief. No actual request has been sent to an agency.`;
  }

  function submit() {
    const brief = generateBrief();

    const submission: ProjectSubmission = {
      id: `ONB-${Date.now()}`,
      ...answers,
      brief,
      status: "New",
      createdAt: new Date().toISOString(),
    };

    try {
      saveSubmission(submission);
      onComplete(submission);
    } catch {
      setError("Unable to save this submission. Please check your browser storage.");
    }
  }

  function editAnswer(index: number) {
    setStep(index);
    setReview(false);
  }

  return (
    <section className="intake-card">
      <div className="intake-top">
        <div>
          <span className="eyebrow">CLIENT ONBOARDING</span>
          <h2>{review ? "Review your project" : "Let's plan your project"}</h2>
          <p>
            {review
              ? "Check your information before generating your brief."
              : "Answer a few questions to help us understand your goals."}
          </p>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close onboarding">×</button>
      </div>

      <div className="progress-meta">
        <span>{review ? "Final review" : `Step ${step + 1} of ${questions.length}`}</span>
        <span>{review ? "Almost done" : `${Math.round(((step + 1) / questions.length) * 100)}%`}</span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${review ? 100 : ((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      {review ? (
        <>
          <div className="review-area">
            {questions.map((question, index) => (
              <div className="review-row" key={question.key}>
                <div>
                  <span>{question.title}</span>
                  <strong>{answers[question.key as keyof Answers] || "Not provided"}</strong>
                </div>
                <button onClick={() => editAnswer(index)}>Edit</button>
              </div>
            ))}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="intake-actions">
            <button className="btn-secondary" onClick={() => setReview(false)}>Back</button>
            <button className="btn-primary" onClick={submit}>Generate project brief →</button>
          </div>
        </>
      ) : (
        <div className="question-area">
          <h3>{current.title}</h3>
          <p>{current.help}</p>

          {current.type === "text" || current.type === "email" ? (
            <input
              type={current.type}
              value={value}
              onChange={(e) => update(e.target.value)}
              placeholder="Type your answer..."
              autoComplete={current.key === "email" ? "email" : "off"}
            />
          ) : current.type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => update(e.target.value)}
              placeholder="Write your answer here..."
              rows={4}
            />
          ) : (
            <div className="choice-grid">
              {(current.key === "service"
                ? services
                : current.key === "budget"
                  ? budgets
                  : timeframes
              ).map((option) => (
                <button
                  key={option}
                  className={`choice ${value === option ? "selected" : ""}`}
                  onClick={() => update(option)}
                >
                  {option}
                  <span>{value === option ? "✓" : "+"}</span>
                </button>
              ))}
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="intake-actions">
            <button
              className="btn-secondary"
              onClick={() => step === 0 ? onClose() : setStep(step - 1)}
            >
              ← Back
            </button>
            <button className="btn-primary" onClick={next}>
              {step === questions.length - 1 ? "Review answers" : "Continue"} →
            </button>
          </div>
        </div>
      )}

      <p className="privacy-note">
        Demo environment · Your submission is stored locally in this browser only.
      </p>
    </section>
  );
}
