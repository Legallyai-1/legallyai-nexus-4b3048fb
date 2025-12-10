-- Academy Progress Tracking Tables

-- Course categories and courses
CREATE TABLE public.academy_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_hours INTEGER,
  is_bar_prep BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course lessons/modules
CREATE TABLE public.academy_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User progress tracking
CREATE TABLE public.academy_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Quiz/exam questions
CREATE TABLE public.academy_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  is_bar_exam BOOLEAN DEFAULT false,
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz questions
CREATE TABLE public.academy_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.academy_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- User quiz attempts
CREATE TABLE public.academy_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.academy_quizzes(id) ON DELETE CASCADE,
  score INTEGER,
  max_score INTEGER,
  passed BOOLEAN,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Certificates earned
CREATE TABLE public.academy_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;

-- Courses and lessons are publicly viewable
CREATE POLICY "Courses are publicly viewable"
ON public.academy_courses FOR SELECT
USING (true);

CREATE POLICY "Lessons are publicly viewable"
ON public.academy_lessons FOR SELECT
USING (true);

CREATE POLICY "Quizzes are publicly viewable"
ON public.academy_quizzes FOR SELECT
USING (true);

CREATE POLICY "Quiz questions are publicly viewable"
ON public.academy_quiz_questions FOR SELECT
USING (true);

-- Users can manage their own progress
CREATE POLICY "Users can view own progress"
ON public.academy_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON public.academy_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON public.academy_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Users can manage their own quiz attempts
CREATE POLICY "Users can view own quiz attempts"
ON public.academy_quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts"
ON public.academy_quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts"
ON public.academy_quiz_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
ON public.academy_certificates FOR SELECT
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_academy_courses_updated_at
BEFORE UPDATE ON public.academy_courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_academy_progress_updated_at
BEFORE UPDATE ON public.academy_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();