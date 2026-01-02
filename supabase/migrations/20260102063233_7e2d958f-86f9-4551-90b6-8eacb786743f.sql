-- Create table for storing user symptoms and health evaluations
CREATE TABLE public.user_symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms TEXT[] NOT NULL,
  severity TEXT DEFAULT 'moderate',
  notes TEXT,
  analysis TEXT,
  recommendations JSONB,
  future_predictions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own symptoms" 
ON public.user_symptoms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms" 
ON public.user_symptoms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms" 
ON public.user_symptoms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms" 
ON public.user_symptoms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_symptoms_updated_at
BEFORE UPDATE ON public.user_symptoms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();