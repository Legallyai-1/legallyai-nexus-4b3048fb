import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Workflow, Plus, CheckCircle, Clock, AlertTriangle, Users,
  Calendar, FileText, MessageSquare, Milestone, ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CaseWorkflowManagerProps {
  caseId?: string;
  organizationId?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  assigned_to?: string;
  is_auto_generated: boolean;
}

interface Stage {
  id: string;
  name: string;
  order_index: number;
  color?: string;
  auto_tasks?: any[];
}

const DEFAULT_STAGES: Stage[] = [
  { id: '1', name: 'Intake', order_index: 0, color: '#8b5cf6' },
  { id: '2', name: 'Investigation', order_index: 1, color: '#06b6d4' },
  { id: '3', name: 'Discovery', order_index: 2, color: '#22c55e' },
  { id: '4', name: 'Motion Practice', order_index: 3, color: '#f59e0b' },
  { id: '5', name: 'Trial Prep', order_index: 4, color: '#ef4444' },
  { id: '6', name: 'Resolution', order_index: 5, color: '#10b981' }
];

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Initial client interview', status: 'completed', priority: 'high', due_date: '2024-01-15', is_auto_generated: true },
  { id: '2', title: 'Gather initial documents', status: 'completed', priority: 'high', due_date: '2024-01-20', is_auto_generated: true },
  { id: '3', title: 'File complaint', status: 'in_progress', priority: 'high', due_date: '2024-02-01', is_auto_generated: false },
  { id: '4', title: 'Serve defendant', status: 'pending', priority: 'high', due_date: '2024-02-15', is_auto_generated: true },
  { id: '5', title: 'Prepare interrogatories', status: 'pending', priority: 'medium', due_date: '2024-03-01', is_auto_generated: false },
  { id: '6', title: 'Request production of documents', status: 'pending', priority: 'medium', due_date: '2024-03-15', is_auto_generated: true },
];

const TIMELINE_EVENTS = [
  { id: '1', type: 'case_opened', title: 'Case Opened', date: '2024-01-10', description: 'New case file created' },
  { id: '2', type: 'document', title: 'Complaint Filed', date: '2024-01-20', description: 'Initial complaint filed with court' },
  { id: '3', type: 'milestone', title: 'Service Completed', date: '2024-02-01', description: 'Defendant served successfully' },
  { id: '4', type: 'deadline', title: 'Answer Due', date: '2024-03-01', description: 'Defendant response deadline' },
];

export function CaseWorkflowManager({ caseId, organizationId = 'default-org' }: CaseWorkflowManagerProps) {
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [currentStage, setCurrentStage] = useState(2); // Discovery
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  const fetchWorkflowData = async () => {
    if (!caseId) return;
    
    setLoading(true);
    try {
      const [tasksResult, stagesResult, timelineResult] = await Promise.all([
        supabase.from('case_tasks').select('*').eq('case_id', caseId).order('due_date'),
        supabase.from('case_stages').select('*').eq('organization_id', organizationId).order('order_index'),
        supabase.from('case_timelines').select('*').eq('case_id', caseId).order('event_date', { ascending: false })
      ]);

      if (tasksResult.data?.length) setTasks(tasksResult.data as Task[]);
      if (stagesResult.data?.length) setStages(stagesResult.data as Stage[]);
    } catch (error) {
      console.error('Error fetching workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowData();
  }, [caseId, organizationId]);

  const addTask = async () => {
    if (!newTask.title) {
      toast.error('Task title is required');
      return;
    }

    try {
      const task: Task = {
        id: crypto.randomUUID(),
        ...newTask,
        status: 'pending',
        is_auto_generated: false
      };

      if (caseId) {
        await supabase.from('case_tasks').insert({
          case_id: caseId,
          organization_id: organizationId,
          ...task
        });
      }

      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', priority: 'medium', due_date: '' });
      setShowAddTask(false);
      toast.success('Task added successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      if (caseId) {
        await supabase.from('case_tasks').update({ status }).eq('id', taskId);
      }
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success('Task updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge variant="secondary">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Pipeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Case Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {stages.map((stage, index) => (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => setCurrentStage(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all ${
                    index === currentStage
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStage
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {index < currentStage && <CheckCircle className="h-4 w-4" />}
                    <span className="font-medium">{stage.name}</span>
                  </div>
                </button>
                {index < stages.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="deadlines">Deadlines</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Task Management</CardTitle>
              <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        value={newTask.priority}
                        onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      />
                    </div>
                    <Button onClick={addTask} className="w-full">Create Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <button
                      onClick={() => updateTaskStatus(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.is_auto_generated && (
                        <Badge variant="outline" className="text-xs">Auto</Badge>
                      )}
                      {getPriorityBadge(task.priority)}
                      {task.due_date && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                <div className="space-y-6">
                  {TIMELINE_EVENTS.map((event, index) => (
                    <div key={event.id} className="relative pl-10">
                      <div className={`absolute left-2 w-4 h-4 rounded-full ${
                        event.type === 'milestone' ? 'bg-primary' :
                        event.type === 'deadline' ? 'bg-red-500' :
                        event.type === 'document' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`} />
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deadlines">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks
                  .filter(t => t.due_date && t.status !== 'completed')
                  .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
                  .map((task) => {
                    const dueDate = new Date(task.due_date!);
                    const today = new Date();
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntil < 0;
                    const isUrgent = daysUntil <= 3 && daysUntil >= 0;

                    return (
                      <div 
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          isOverdue ? 'bg-red-500/10 border border-red-500/30' :
                          isUrgent ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          'bg-muted/50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={isOverdue ? 'destructive' : isUrgent ? 'secondary' : 'outline'}>
                          {isOverdue ? `${Math.abs(daysUntil)} days overdue` :
                           daysUntil === 0 ? 'Due today' :
                           `${daysUntil} days left`}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team & Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Team collaboration features coming soon</p>
                <p className="text-sm">Assign tasks, @mention team members, and track contributions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
