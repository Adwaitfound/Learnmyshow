"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface QuestionRecord {
  id: string;
  content: string;
  answer: string | null;
  createdAt: string;
  asker: { name: string | null; email: string };
  session: {
    title: string;
    track: { name: string };
    event: { title: string };
  };
}

export default function InstructorQAPage() {
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/my/qa");
    if (res.ok) {
      const json = await res.json();
      setQuestions(json.questions);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAnswer(questionId: string) {
    if (!answerText.trim()) return;
    setSaving(true);
    await fetch("/api/my/qa", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, answer: answerText }),
    });
    await load();
    setSaving(false);
    setAnswering(null);
    setAnswerText("");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  const unanswered = questions.filter((q) => !q.answer).length;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Q&A</h1>
          <p className="text-muted">
            Questions from attendees in your sessions
          </p>
        </div>
        {unanswered > 0 && (
          <Badge variant="warning">{unanswered} unanswered</Badge>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface-card py-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-muted">No questions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-xl border border-surface-border bg-surface-card p-5"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {q.answer ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{q.content}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span>
                      {q.asker.name || q.asker.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="info">
                      {q.session.title} · {q.session.event.title}
                    </Badge>
                  </div>

                  {/* Answer section */}
                  {q.answer ? (
                    <div className="mt-3 rounded-lg bg-green-500/10 p-3">
                      <p className="text-sm text-green-400">{q.answer}</p>
                    </div>
                  ) : answering === q.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        rows={3}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full rounded-lg border border-surface-border bg-surface-elevated text-white placeholder-gray-500 px-3 py-2 text-sm focus:border-neon focus:outline-none focus:ring-1 focus:ring-neon"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={() => handleAnswer(q.id)}
                        >
                          {saving ? "Saving..." : "Submit Answer"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAnswering(null);
                            setAnswerText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setAnswering(q.id)}
                    >
                      Answer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
