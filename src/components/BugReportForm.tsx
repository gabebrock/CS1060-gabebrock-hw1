import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bug, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const BugReportForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: '',
    description: '',
    screenshot: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return false;
    }
    if (!formData.issue.trim()) {
      toast({ title: "Issue title is required", variant: "destructive" });
      return false;
    }
    if (!formData.description.trim()) {
      toast({ title: "Issue description is required", variant: "destructive" });
      return false;
    }
    return true;
  };

  const uploadScreenshot = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('bug-screenshots')
        .upload(fileName, file);

      if (error) {
        console.error('Screenshot upload error:', error);
        return null;
      }

      return fileName;
    } catch (error) {
      console.error('Screenshot upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let screenshotUrl = null;
      
      // Upload screenshot if provided
      if (formData.screenshot) {
        screenshotUrl = await uploadScreenshot(formData.screenshot);
        if (!screenshotUrl) {
          toast({ 
            title: "Screenshot upload failed", 
            description: "Continuing with bug report submission",
            variant: "destructive" 
          });
        }
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('bug_reports')
        .insert({
          name: formData.name,
          email: formData.email,
          issue_title: formData.issue,
          description: formData.description,
          screenshot_url: screenshotUrl,
          user_agent: navigator.userAgent
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save bug report');
      }

      // Send email notification
      try {
        await supabase.functions.invoke('send-bug-report', {
          body: {
            name: formData.name,
            email: formData.email,
            issueTitle: formData.issue,
            description: formData.description,
            screenshotUrl: screenshotUrl,
            userAgent: navigator.userAgent
          }
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't throw here - bug report was saved successfully
      }

      // Reset form
      setFormData({ name: '', email: '', issue: '', description: '', screenshot: null });
      setIsOpen(false);
      
      toast({ 
        title: "Bug report submitted successfully!", 
        description: "Thank you for helping us improve the app." 
      });

    } catch (error) {
      console.error('Submission error:', error);
      toast({ 
        title: "Submission failed", 
        description: "Please try again or contact support.",
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
        >
          <Bug className="w-4 h-4 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Report Bug or Issue
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Your email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issue">Issue Title</Label>
            <Input
              id="issue"
              value={formData.issue}
              onChange={(e) => setFormData(prev => ({ ...prev, issue: e.target.value }))}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Issue Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of what happened and steps to reproduce"
              rows={4}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot (Optional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('screenshot')?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.screenshot ? formData.screenshot.name : 'Upload Screenshot'}
              </Button>
            </div>
          </div>
          
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};