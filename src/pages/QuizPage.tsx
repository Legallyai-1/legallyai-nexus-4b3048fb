import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  Clock,
  Loader2,
  RotateCcw
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  passing_score: number | null;
  time_limit_minutes: number | null;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number | null;
}

export default function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("id");
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (quizId) {
      // Check if it's a course ID or quiz ID
      fetchQuizByCourseOrId(quizId);
    } else {
      fetchRandomQuiz();
    }
  }, [quizId]);

  const fetchQuizByCourseOrId = async (id: string) => {
    try {
      // First try to find a quiz with this course_id
      const { data: quizByCourse } = await supabase
        .from('academy_quizzes')
        .select('id')
        .eq('course_id', id)
        .limit(1)
        .single();
      
      if (quizByCourse) {
        await fetchQuizData(quizByCourse.id);
      } else {
        // Try as direct quiz id
        await fetchQuizData(id);
      }
    } catch (error) {
      console.error('Error:', error);
      fetchRandomQuiz();
    }
  };

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t && t <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return t ? t - 1 : null;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  const fetchRandomQuiz = async () => {
    try {
      const { data: quizzes, error } = await supabase
        .from('academy_quizzes')
        .select('id')
        .limit(10);
      
      if (error) throw error;
      if (quizzes && quizzes.length > 0) {
        const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
        await fetchQuizData(randomQuiz.id);
      }
    } catch (error) {
      console.error('Error fetching random quiz:', error);
      setIsLoading(false);
    }
  };

  const fetchQuiz = async () => {
    if (!quizId) return;
    await fetchQuizData(quizId);
  };

  const fetchQuizData = async (id: string) => {
    try {
      const [quizResult, questionsResult] = await Promise.all([
        supabase.from('academy_quizzes').select('*').eq('id', id).single(),
        supabase.from('academy_quiz_questions').select('*').eq('quiz_id', id).order('order_index')
      ]);
      
      if (quizResult.error) throw quizResult.error;
      if (questionsResult.error) throw questionsResult.error;
      
      setQuiz(quizResult.data);
      
      // Parse options from JSON
      const parsedQuestions = (questionsResult.data || []).map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string || '[]')
      }));
      
      setQuestions(parsedQuestions);
      
      if (quizResult.data.time_limit_minutes) {
        setTimeLeft(quizResult.data.time_limit_minutes * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isSubmitted) return;
    setSelectedAnswer(answer);
    setAnswers(prev => ({ ...prev, [questions[currentIndex].id]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(answers[questions[currentIndex + 1]?.id] || null);
      setIsSubmitted(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setSelectedAnswer(answers[questions[currentIndex - 1]?.id] || null);
      setIsSubmitted(false);
    }
  };

  const handleCheckAnswer = () => {
    setIsSubmitted(true);
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResult(true);
  };

  const handleRetakeQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setShowResult(false);
    setIsSubmitted(false);
    setScore(0);
    if (quiz?.time_limit_minutes) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Layout>
        <FuturisticBackground>
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <AnimatedAIHead variant="purple" size="lg" />
              <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
              <p className="text-muted-foreground">Loading quiz...</p>
            </div>
          </div>
        </FuturisticBackground>
      </Layout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <Layout>
        <FuturisticBackground>
          <div className="min-h-screen flex items-center justify-center">
            <Card className="glass-card p-8 text-center max-w-md">
              <Brain className="h-16 w-16 text-neon-purple mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-foreground mb-4">No Quiz Available</h2>
              <p className="text-muted-foreground mb-6">This quiz doesn't have any questions yet.</p>
              <Button variant="neon" onClick={() => navigate("/legal-academy")}>
                Back to Academy
              </Button>
            </Card>
          </div>
        </FuturisticBackground>
      </Layout>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= (quiz.passing_score || 70);
    
    return (
      <Layout>
        <FuturisticBackground>
          <div className="min-h-screen py-12 px-4 flex items-center justify-center">
            <Card className={`glass-card p-8 max-w-lg text-center ${passed ? 'border-neon-green/50' : 'border-neon-orange/50'}`}>
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? 'bg-neon-green/20' : 'bg-neon-orange/20'
              }`}>
                {passed ? (
                  <Trophy className="h-12 w-12 text-neon-green" />
                ) : (
                  <Brain className="h-12 w-12 text-neon-orange" />
                )}
              </div>
              
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                {passed ? "Congratulations!" : "Keep Learning!"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {passed 
                  ? "You've passed the quiz!" 
                  : `You need ${quiz.passing_score || 70}% to pass. Keep studying!`
                }
              </p>
              
              <div className={`text-6xl font-display font-bold mb-2 ${
                passed ? 'text-neon-green' : 'text-neon-orange'
              }`}>
                {percentage}%
              </div>
              <p className="text-muted-foreground mb-6">
                {score} of {questions.length} correct
              </p>
              
              <div className="flex flex-col gap-3">
                <Button variant={passed ? "neon-green" : "neon"} onClick={handleRetakeQuiz} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Retake Quiz
                </Button>
                <Button variant="outline" onClick={() => navigate("/legal-academy")}>
                  Back to Academy
                </Button>
              </div>
            </Card>
          </div>
        </FuturisticBackground>
      </Layout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Layout>
      <FuturisticBackground>
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AnimatedAIHead variant="purple" size="sm" />
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">{quiz.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>
              {timeLeft !== null && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeLeft < 60 ? 'bg-destructive/20 text-destructive' : 'bg-neon-cyan/20 text-neon-cyan'
                }`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2 mb-8" />

            {/* Question Card */}
            <Card className="glass-card p-6 mb-6">
              <h2 className="text-xl font-medium text-foreground mb-6">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correct_answer;
                  const showCorrectness = isSubmitted;
                  
                  let optionClass = "glass-card p-4 cursor-pointer transition-all border-2";
                  if (showCorrectness) {
                    if (isCorrect) {
                      optionClass += " border-neon-green bg-neon-green/10";
                    } else if (isSelected && !isCorrect) {
                      optionClass += " border-destructive bg-destructive/10";
                    } else {
                      optionClass += " border-transparent opacity-50";
                    }
                  } else if (isSelected) {
                    optionClass += " border-neon-purple bg-neon-purple/10";
                  } else {
                    optionClass += " border-transparent hover:border-neon-purple/50";
                  }
                  
                  return (
                    <div
                      key={idx}
                      className={optionClass}
                      onClick={() => handleSelectAnswer(option)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isSelected 
                            ? 'bg-neon-purple text-background' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="flex-1 text-foreground">{option}</span>
                        {showCorrectness && isCorrect && (
                          <CheckCircle className="h-5 w-5 text-neon-green" />
                        )}
                        {showCorrectness && isSelected && !isCorrect && (
                          <XCircle className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {isSubmitted && currentQuestion.explanation && (
                <div className="mt-6 p-4 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-neon-blue">Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>
              
              <div className="flex gap-3">
                {!isSubmitted && selectedAnswer && (
                  <Button variant="neon-purple" onClick={handleCheckAnswer}>
                    Check Answer
                  </Button>
                )}
                
                {currentIndex === questions.length - 1 ? (
                  <Button 
                    variant="neon-green" 
                    onClick={handleSubmitQuiz}
                    className="gap-2"
                  >
                    Submit Quiz <Trophy className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="neon"
                    onClick={handleNextQuestion}
                    className="gap-2"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </FuturisticBackground>
    </Layout>
  );
}
