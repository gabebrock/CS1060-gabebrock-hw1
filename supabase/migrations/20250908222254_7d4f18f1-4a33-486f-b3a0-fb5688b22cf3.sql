-- Create bug reports table
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  issue_title TEXT NOT NULL,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'))
);

-- Enable Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert bug reports
CREATE POLICY "Anyone can submit bug reports" 
ON public.bug_reports 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading (admin only - you can modify this later)
CREATE POLICY "Bug reports are viewable by authenticated users only" 
ON public.bug_reports 
FOR SELECT 
USING (false); -- Change to auth.uid() IS NOT NULL if you want authenticated users to see

-- Create storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('bug-screenshots', 'bug-screenshots', false);

-- Create storage policies for bug screenshots
CREATE POLICY "Anyone can upload bug screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'bug-screenshots');

CREATE POLICY "Bug screenshots are viewable by authenticated users only" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'bug-screenshots' AND auth.uid() IS NOT NULL);