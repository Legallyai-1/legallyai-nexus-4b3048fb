import { useState, forwardRef } from 'react';
import { Bug, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const HUBS = [
  'Lee Legal AI', 'CustodiAI', 'DefendrAI', 'DriveSafeAI', 'MaryAI',
  'LegacyAI', 'Freedom AI', 'WorkplaceAI', 'PraxisAI', 'ScholarAI',
  'JobBoardAI', 'ProBonoAI', 'LoanAI', 'General/Other'
];

// Forward ref button component to fix Dialog ref warning
const BugButton = forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>((props, ref) => (
  <Button ref={ref} {...props} />
));
BugButton.displayName = 'BugButton';

export const BugReportButton = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hub_name: '',
    severity: 'medium',
    category: 'bug',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    reporter_name: '',
    reporter_email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const browserInfo = `${navigator.userAgent}`;
      const deviceInfo = `${navigator.platform} - ${window.innerWidth}x${window.innerHeight}`;

      const { error } = await supabase.from('bug_reports').insert({
        ...formData,
        user_id: user?.id || null,
        page_url: location.pathname,
        browser_info: browserInfo,
        device_info: deviceInfo
      });

      if (error) throw error;

      toast.success('Bug report submitted! Thank you for helping improve LegallyAI.');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        hub_name: '',
        severity: 'medium',
        category: 'bug',
        steps_to_reproduce: '',
        expected_behavior: '',
        actual_behavior: '',
        reporter_name: '',
        reporter_email: ''
      });
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <BugButton
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 z-50 h-12 w-12 rounded-full bg-destructive/90 hover:bg-destructive text-white border-none shadow-lg"
          title="Report a Bug"
        >
          <Bug className="h-5 w-5" />
        </BugButton>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-destructive" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporter_name">Your Name</Label>
              <Input
                id="reporter_name"
                placeholder="John Doe"
                value={formData.reporter_name}
                onChange={(e) => setFormData(prev => ({ ...prev, reporter_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reporter_email">Your Email</Label>
              <Input
                id="reporter_email"
                type="email"
                placeholder="john@example.com"
                value={formData.reporter_email}
                onChange={(e) => setFormData(prev => ({ ...prev, reporter_email: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hub/Section</Label>
              <Select
                value={formData.hub_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, hub_name: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hub" />
                </SelectTrigger>
                <SelectContent>
                  {HUBS.map(hub => (
                    <SelectItem key={hub} value={hub}>{hub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="ui">UI Issue</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="crash">Crash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Steps to Reproduce</Label>
            <Textarea
              id="steps"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              value={formData.steps_to_reproduce}
              onChange={(e) => setFormData(prev => ({ ...prev, steps_to_reproduce: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected">Expected Behavior</Label>
              <Textarea
                id="expected"
                placeholder="What should happen?"
                value={formData.expected_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, expected_behavior: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actual">Actual Behavior</Label>
              <Textarea
                id="actual"
                placeholder="What actually happened?"
                value={formData.actual_behavior}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_behavior: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
