import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const questions = [
  {
    question: "How do you prefer to learn new information?",
    options: [
      "Reading and writing",
      "Listening and discussing",
      "Visual diagrams and charts",
      "Hands-on practice"
    ]
  },
  {
    question: "When solving problems, you typically:",
    options: [
      "Analyze details methodically",
      "Trust your intuition",
      "Look for patterns",
      "Try different approaches"
    ]
  },
  {
    question: "In group settings, you usually:",
    options: [
      "Take charge and organize",
      "Contribute ideas and participate",
      "Observe and analyze",
      "Support and encourage others"
    ]
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculatePersonality = () => {
    const answerValues = Object.values(answers);
    let personality = "";

    // Simple personality calculation based on most frequent answers
    const counts = answerValues.reduce((acc: Record<string, number>, value) => {
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

    const maxCount = Math.max(...Object.values(counts));
    const dominantTraits = Object.entries(counts)
      .filter(([_, count]) => count === maxCount)
      .map(([trait]) => trait);

    if (dominantTraits.includes("Reading and writing") || dominantTraits.includes("Analyze details methodically")) {
      personality = "Analytical Learner";
    } else if (dominantTraits.includes("Listening and discussing") || dominantTraits.includes("Trust your intuition")) {
      personality = "Intuitive Learner";
    } else if (dominantTraits.includes("Visual diagrams and charts") || dominantTraits.includes("Look for patterns")) {
      personality = "Visual Learner";
    } else {
      personality = "Practical Learner";
    }

    return personality;
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setLoading(true);
    const personality = calculatePersonality();

    try {
      const { error } = await supabase.from("quiz_results").insert({
        user_id: userId,
        answers,
        result_summary: personality
      });

      if (error) throw error;

      toast.success("Quiz completed! Your result: " + personality);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-4">Personality Quiz</h1>
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2 text-sm text-gray-600">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            {questions[currentQuestion].question}
          </h2>

          <RadioGroup
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={loading || !answers[currentQuestion]}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              disabled={!answers[currentQuestion]}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;