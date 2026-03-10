import { ThumbsUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const QUESTIONS = [
  {
    id: "q1",
    body: "Can GPT-4 be used for formative assessment without plagiarism concerns?",
    author: "Alice Thompson",
    upvotes: 12,
    answered: true,
    answer:
      "Great question! GPT-4 can absolutely be used for formative assessment when properly designed prompts guide open-ended responses...",
  },
  {
    id: "q2",
    body: "What are the best practices for prompt engineering in an educational context?",
    author: "Ben Carter",
    upvotes: 9,
    answered: false,
    answer: null,
  },
  {
    id: "q3",
    body: "How do you handle students with limited internet access when using AI tools?",
    author: "Clara Nguyen",
    upvotes: 7,
    answered: false,
    answer: null,
  },
];

export default function SessionQAPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Session Q&amp;A</h1>
          <p className="text-gray-500">
            Questions from attendees in your sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {QUESTIONS.length} questions
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={q.answered ? "success" : "warning"}>
                    {q.answered ? "Answered" : "Pending"}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    from {q.author}
                  </span>
                </div>
                <p className="font-medium text-gray-900">{q.body}</p>
                {q.answered && q.answer && (
                  <div className="mt-3 rounded-lg bg-green-50 border border-green-100 p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {q.answer}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 text-sm text-gray-500">
                <ThumbsUp className="h-4 w-4" /> {q.upvotes}
              </div>
            </div>
            {!q.answered && (
              <div className="mt-4">
                <textarea
                  placeholder="Type your answer..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button size="sm" className="mt-2">
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Submit Answer
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
