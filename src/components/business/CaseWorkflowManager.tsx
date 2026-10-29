import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { requireAffectedRows } from '@/lib/mutationResult';
import { findUserOrganization } from '@/lib/organizations';
import { FirmTeamPanel } from '@/components/business/FirmTeamPanel';

interface CaseWorkflowManagerProps {
  caseId?: string;
  organizationId?: string | null;
}

interface TimelineEvent {
  id: string;
  event_title: string;
  event_description: string | null;
  event_type: string;
  event_date: string;
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


export function CaseWorkflowManager({ caseId: caseIdProp, organizationId: organizationIdProp }: CaseWorkflowManagerProps) {
  // case_tasks.case_id is NOT NULL, so every task must belong to a case.
  // When no case is passed in, the user picks one of their organization's cases.
  const [resolvedOrgId, setResolvedOrgId] = useState<string | undefined>(organizationIdProp ?? undefined);
  const [caseOptions, setCaseOptions] = useState<{ id: string; title: string }[]>([]);
  // Case whose tasks are listed (applied after a task is created).
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  // Case chosen in the Add Task dialog; kept separate so picking doesn't swap the list.
  const [dialogCaseId, setDialogCaseId] = useState<string>('');
  const fetchRequestId = useRef(0);
  const caseId = caseIdProp || selectedCaseId || undefined;
  const organizationId = organizationIdProp || resolvedOrgId;
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', type: 'milestone', date: '' });
  const [savingEvent, setSavingEvent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });

  useEffect(() => {
    if (organizationIdProp) {
      setResolvedOrgId(organizationIdProp ?? undefined);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        let orgId: string | null = null;
        if (caseIdProp) {
          // Derive the org from the case itself so task rows always match their case.
          const { data, error } = await supabase
            .from('cases')
            .select('organization_id')
            .eq('id', caseIdProp)
            .maybeSingle();
          if (error) throw error;
          orgId = data?.organization_id ?? null;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          // Read-only lookup: never create an organization as a page-load side effect.
          orgId = await findUserOrganization(user.id);
        }
        if (!cancelled) setResolvedOrgId(orgId ?? undefined);
      } catch (error: any) {
        console.error('Error resolving organization:', error);
        if (!cancelled) toast.error(error?.message || 'Could not load your organization');
      }
    })();
    return () => { cancelled = true; };
  }, [organizationIdProp, caseIdProp]);

  useEffect(() => {
    if (caseIdProp || !organizationId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) {
        console.error('Error loading cases:', error);
        if (!cancelled) toast.error('Could not load cases');
        return;
      }
      if (!cancelled) setCaseOptions(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [caseIdProp, organizationId]);

  const fetchWorkflowData = useCallback(async () => {
    const requestId = ++fetchRequestId.current;
    if (!caseId || !organizationId) {
      setTasks([]);
      setTimeline([]);
      return;
    }

    setLoading(true);
    try {
      const [tasksResult, stagesResult, timelineResult] = await Promise.all([
        supabase.from('case_tasks').select('*').eq('case_id', caseId).order('due_date'),
        supabase.from('case_stages').select('*').eq('organization_id', organizationId).order('order_index'),
        supabase.from('case_timelines').select('*').eq('case_id', caseId).order('event_date', { ascending: false })
      ]);

      if (requestId !== fetchRequestId.current) return; // stale response
      if (tasksResult.error) throw tasksResult.error;
      if (stagesResult.error) throw stagesResult.error;
      if (timelineResult.error) throw timelineResult.error;
      setTasks((tasksResult.data ?? []) as Task[]);
      setTimeline((timelineResult.data ?? []) as TimelineEvent[]);
      if (stagesResult.data?.length) setStages(stagesResult.data as Stage[]);
    } catch (error: any) {
      if (requestId !== fetchRequestId.current) return;
      console.error('Error fetching workflow data:', error);
      toast.error(error?.message || 'Failed to load workflow data');
    } finally {
      if (requestId === fetchRequestId.current) setLoading(false);
    }
  }, [caseId, organizationId]);

  useEffect(() => {
    // Each call bumps fetchRequestId, so responses from older requests are ignored.
    fetchWorkflowData();
  }, [fetchWorkflowData]);

  const addTask = async () => {
    if (!newTask.title) {
      toast.error('Task title is required');
      return;
    }
    const targetCaseId = caseIdProp || dialogCaseId;
    if (!targetCaseId) {
      toast.error('Select a case before adding a task');
      return;
    }

    try {
      const task: Task = {
        id: crypto.randomUUID(),
        ...newTask,
        status: 'pending',
        is_auto_generated: false
      };

      // Always take the org from the case row; never fall back to the user's org.
      const { data: caseRow, error: caseError } = await supabase
        .from('cases')
        .select('organization_id')
        .eq('id', targetCaseId)
        .maybeSingle();
      if (caseError) throw caseError;
      if (!caseRow) {
        toast.error('Case not found or not accessible');
        return;
      }
      if (!caseRow.organization_id) {
        toast.error("This case isn't linked to a firm, so tasks can't be added to it");
        return;
      }

      const { error } = await supabase.from('case_tasks').insert({
        case_id: targetCaseId,
        organization_id: caseRow.organization_id,
        ...task,
        due_date: task.due_date || null
      });
      if (error) throw error;

      if (targetCaseId === caseId) {
        setTasks(prev => [...prev, task]);
      } else {
        setSelectedCaseId(targetCaseId); // show the case the task was added to (refetches)
      }
      setDialogCaseId('');
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
        const { data, error } = await supabase
          .from('case_tasks')
          .update({ status })
          .eq('id', taskId)
          .eq('case_id', caseId)
          .select('id');
        if (error) throw error;
        requireAffectedRows(data, 'updated');
      }
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success('Task updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const addTimelineEvent = async () => {
    if (!caseId) return;
    if (!newEvent.title.trim() || !newEvent.date) {
      toast.error('Event title and date are required');
      return;
    }
    setSavingEvent(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('case_timelines')
        .insert({
          case_id: caseId,
          created_by: user?.id ?? null,
          event_title: newEvent.title.trim(),
          event_description: newEvent.description.trim() || null,
          event_type: newEvent.type,
          event_date: new Date(`${newEvent.date}T12:00:00`).toISOString(),
        })
        .select('id, event_title, event_description, event_type, event_date')
        .single();
      if (error) throw error;
      setTimeline((prev) => [data as TimelineEvent, ...prev].sort((a, b) => b.event_date.localeCompare(a.event_date)));
      setNewEvent({ title: '', description: '', type: 'milestone', date: '' });
      toast.success('Event added to the timeline');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add event');
    } finally {
      setSavingEvent(false);
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

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
      {/* Case picker + firm stages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Case Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!caseIdProp && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger aria-label="Case" className="sm:w-80">
                  <SelectValue placeholder={caseOptions.length ? 'Choose a case' : 'No cases yet'} />
                </SelectTrigger>
                <SelectContent>
                  {caseOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!organizationId ? (
                <p className="text-sm text-muted-foreground">Set up your practice in the Practice tab to start tracking cases.</p>
              ) : !caseOptions.length ? (
                <p className="text-sm text-muted-foreground">Create a case in the Practice tab, then manage its tasks and timeline here.</p>
              ) : null}
            </div>
          )}
          {caseId && (
            <p className="text-sm text-muted-foreground">
              {tasks.length ? `${completedCount} of ${tasks.length} tasks complete` : 'No tasks on this case yet'} · {timeline.length} timeline event{timeline.length === 1 ? '' : 's'}
            </p>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Your firm's case stages</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {stages.map((stage, index) => (
                <React.Fragment key={stage.id}>
                  <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-muted text-sm font-medium">{stage.name}</span>
                  {index < stages.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
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
                    {!caseIdProp && (
                      <div className="space-y-1">
                        <Select value={dialogCaseId} onValueChange={setDialogCaseId}>
                          <SelectTrigger aria-label="Case">
                            <SelectValue placeholder="Select a case (required)" />
                          </SelectTrigger>
                          <SelectContent>
                            {caseOptions.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!dialogCaseId && (
                          <p className="text-xs text-muted-foreground">
                            {caseOptions.length ? 'Tasks must be linked to a case.' : 'No cases found. Create a case first to add tasks.'}
                          </p>
                        )}
                      </div>
                    )}
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
                    <Button onClick={addTask} className="w-full" disabled={!(caseIdProp || dialogCaseId) || !newTask.title.trim()}>Create Task</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {!loading && tasks.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    {caseId ? 'No tasks on this case yet. Select Add Task to create one.' : 'Choose a case to see its tasks.'}
                  </p>
                )}
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
            <CardContent className="space-y-6">
              {!caseId ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Choose a case to see its timeline.</p>
              ) : (
                <>
                  <div className="grid gap-2 sm:grid-cols-[1fr_10rem_10rem_auto] items-start">
                    <Input placeholder="Event (e.g. Complaint filed)" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                    <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                      <SelectTrigger aria-label="Event type"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="hearing">Hearing</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="date" aria-label="Event date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                    <Button onClick={addTimelineEvent} disabled={savingEvent || !newEvent.title.trim() || !newEvent.date}>
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                    <Textarea className="sm:col-span-4" rows={2} placeholder="Details (optional)" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                  </div>
                  {timeline.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No timeline events yet.</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                      <div className="space-y-6">
                        {timeline.map((event) => (
                          <div key={event.id} className="relative pl-10">
                            <div className={`absolute left-2 w-4 h-4 rounded-full ${
                              event.event_type === 'milestone' ? 'bg-primary' :
                              event.event_type === 'deadline' ? 'bg-red-500' :
                              event.event_type === 'document' ? 'bg-blue-500' :
                              'bg-green-500'
                            }`} />
                            <div className="bg-muted/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <h4 className="font-medium">{event.event_title}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                              </div>
                              {event.event_description && <p className="text-sm text-muted-foreground">{event.event_description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
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
                {!tasks.some(t => t.due_date && t.status !== 'completed') && (
                  <p className="text-sm text-muted-foreground py-6 text-center">No open tasks with due dates{caseId ? ' on this case' : ''}.</p>
                )}
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
          {organizationId ? (
            <FirmTeamPanel organizationId={organizationId} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Set up your practice in the Practice tab, then invite your team here.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
