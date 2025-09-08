import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bug, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BugReportForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    issue: '',
    description: '',
    screenshot: null as File | null
  });
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: '' });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Generate new captcha when dialog opens
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1, num2, answer: '' });
  };

  const handleOpen = () => {
    setIsOpen(true);
    generateCaptcha();
  };

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
    if (parseInt(captcha.answer) !== (captcha.num1 + captcha.num2)) {
      toast({ title: "Captcha answer is incorrect", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const subject = `[MET CURATOR ISSUE] ${formData.issue}`;
    const body = `Name: ${formData.name}

Issue: ${formData.issue}

Description:
${formData.description}

${formData.screenshot ? `Screenshot attached: ${formData.screenshot.name}` : 'No screenshot attached'}

---
Submitted from MET Museum Art Curator App`;

    const mailtoLink = `mailto:gbrock@college.harvard.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open email client
    window.open(mailtoLink);
    
    // Reset form
    setFormData({ name: '', issue: '', description: '', screenshot: null });
    setCaptcha({ num1: 0, num2: 0, answer: '' });
    setIsOpen(false);
    
    toast({ 
      title: "Email client opened", 
      description: "Please send the email from your email client. If you have a screenshot, please attach it manually." 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground"
          onClick={handleOpen}
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
          
          <div className="space-y-2">
            <Label htmlFor="captcha">Security Check</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">What is {captcha.num1} + {captcha.num2}?</span>
              <Input
                id="captcha"
                type="number"
                value={captcha.answer}
                onChange={(e) => setCaptcha(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Answer"
                className="w-20"
                required
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Submit Issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};