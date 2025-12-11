-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"remedy_types": [], "yoga_preference": true, "diet_preference": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create health_searches table to track user searches
CREATE TABLE public.health_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_issue TEXT NOT NULL,
  category TEXT,
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved_remedies table for remedies users save
CREATE TABLE public.saved_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  health_issue TEXT NOT NULL,
  remedy_name TEXT NOT NULL,
  remedy_details JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  tried BOOLEAN DEFAULT false,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wellness_stats table for tracking user wellness metrics
CREATE TABLE public.wellness_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stress_level INTEGER DEFAULT 50 CHECK (stress_level >= 0 AND stress_level <= 100),
  sleep_quality INTEGER DEFAULT 50 CHECK (sleep_quality >= 0 AND sleep_quality <= 100),
  fatigue_level INTEGER DEFAULT 50 CHECK (fatigue_level >= 0 AND fatigue_level <= 100),
  digestion_health INTEGER DEFAULT 50 CHECK (digestion_health >= 0 AND digestion_health <= 100),
  immunity_score INTEGER DEFAULT 50 CHECK (immunity_score >= 0 AND immunity_score <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wellness_plans table for AI-generated weekly plans
CREATE TABLE public.wellness_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_plans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Health searches policies
CREATE POLICY "Users can view own searches" ON public.health_searches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own searches" ON public.health_searches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own searches" ON public.health_searches FOR DELETE USING (auth.uid() = user_id);

-- Saved remedies policies
CREATE POLICY "Users can view own remedies" ON public.saved_remedies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own remedies" ON public.saved_remedies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own remedies" ON public.saved_remedies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own remedies" ON public.saved_remedies FOR DELETE USING (auth.uid() = user_id);

-- Wellness stats policies
CREATE POLICY "Users can view own stats" ON public.wellness_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.wellness_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wellness plans policies
CREATE POLICY "Users can view own plans" ON public.wellness_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.wellness_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.wellness_plans FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_remedies_updated_at
  BEFORE UPDATE ON public.saved_remedies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();