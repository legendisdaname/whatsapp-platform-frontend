import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionAPI, botAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../components/ui/Select';
import {
  Bot,
  Plus,
  Play,
  Edit2,
  Trash2,
  RefreshCw,
  Clock,
  Users as UsersIcon,
  Loader2,
  Power,
  PowerOff,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Calendar,
  Timer
} from 'lucide-react';

function Bots() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [bots, setBots] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  
  const [formData, setFormData] = useState({
    session_id: '',
    name: '',
    message_template: '',
    target_numbers: '',
    schedule_pattern: '',
    is_active: false
  });

  const [scheduleType, setScheduleType] = useState('manual'); // 'manual', 'daily', 'weekly', 'custom'
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [scheduleDays, setScheduleDays] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsResponse, botsResponse] = await Promise.all([
        sessionAPI.getAll(),
        botAPI.getAll()
      ]);
      
      setSessions(sessionsResponse.data.sessions || []);
      setBots(botsResponse.data.bots || []);
      
      const allSessions = sessionsResponse.data.sessions || [];
      if (allSessions.length > 0) {
        const groupsResponse = await fetch(`${process.env.REACT_APP_API_URL || 'https://whatapi.streamfinitytv.com'}/api/contacts/groups`);
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.groups || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      session_id: '',
      name: '',
      message_template: '',
      target_numbers: '',
      schedule_pattern: '',
      is_active: false
    });
    setScheduleType('manual');
    setScheduleTime('09:00');
    setScheduleDays([]);
  };

  const generateCronPattern = () => {
    if (scheduleType === 'manual') return '';
    if (scheduleType === 'daily') {
      const [hours, minutes] = scheduleTime.split(':');
      return `${minutes} ${hours} * * *`;
    }
    if (scheduleType === 'weekly') {
      const [hours, minutes] = scheduleTime.split(':');
      const daysOfWeek = scheduleDays.join(',');
      return `${minutes} ${hours} * * ${daysOfWeek}`;
    }
    return '';
  };

  const parseCronPattern = (pattern) => {
    if (!pattern) return { type: 'manual', time: '09:00', days: [] };
    
    const parts = pattern.split(' ');
    if (parts.length === 5 && parts[2] === '*' && parts[3] === '*' && parts[4] === '*') {
      // Daily pattern: "minutes hours * * *"
      const minutes = parts[0];
      const hours = parts[1];
      return { type: 'daily', time: `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`, days: [] };
    }
    
    if (parts.length === 5 && parts[2] === '*' && parts[3] === '*') {
      // Weekly pattern: "minutes hours * * days"
      const minutes = parts[0];
      const hours = parts[1];
      const days = parts[4].split(',').map(d => parseInt(d));
      return { type: 'weekly', time: `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`, days };
    }
    
    return { type: 'custom', time: '09:00', days: [] };
  };

  const createBot = async (e) => {
    e.preventDefault();
    try {
      const numbersArray = formData.target_numbers.split(',').map(n => n.trim()).filter(n => n);
      if (numbersArray.length === 0) {
        alert('Please enter at least one target number');
        return;
      }

      const cronPattern = generateCronPattern();
      
      await botAPI.create({
        ...formData,
        target_numbers: numbersArray,
        schedule_pattern: cronPattern || null
      });

      resetForm();
      setShowCreateModal(false);
      fetchData();
      alert('Bot created successfully!');
    } catch (error) {
      console.error('Error creating bot:', error);
      alert('Failed to create bot: ' + error.message);
    }
  };

  const updateBot = async (e) => {
    e.preventDefault();
    if (!editingBot) return;

    try {
      const updates = { ...formData };
      if (typeof formData.target_numbers === 'string') {
        updates.target_numbers = formData.target_numbers.split(',').map(n => n.trim()).filter(n => n);
      }

      const cronPattern = generateCronPattern();
      updates.schedule_pattern = cronPattern || null;

      await botAPI.update(editingBot.id, updates);
      resetForm();
      setEditingBot(null);
      setShowEditModal(false);
      fetchData();
      alert('Bot updated successfully!');
    } catch (error) {
      console.error('Error updating bot:', error);
      alert('Failed to update bot: ' + error.message);
    }
  };

  const deleteBot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;
    try {
      await botAPI.delete(id);
      fetchData();
      alert('Bot deleted successfully!');
    } catch (error) {
      console.error('Error deleting bot:', error);
      alert('Failed to delete bot');
    }
  };

  const toggleBot = async (bot) => {
    try {
      await botAPI.update(bot.id, { is_active: !bot.is_active });
      fetchData();
    } catch (error) {
      console.error('Error toggling bot:', error);
      alert('Failed to toggle bot');
    }
  };

  const triggerBot = async (id) => {
    if (!window.confirm('Send messages now?')) return;
    try {
      await botAPI.trigger(id);
      alert('Bot triggered! Messages are being sent.');
    } catch (error) {
      console.error('Error triggering bot:', error);
      alert('Failed to trigger bot: ' + error.message);
    }
  };

  const openEditModal = (bot) => {
    setEditingBot(bot);
    setFormData({
      session_id: bot.session_id,
      name: bot.name,
      message_template: bot.message_template,
      target_numbers: Array.isArray(bot.target_numbers) ? bot.target_numbers.join(', ') : bot.target_numbers,
      schedule_pattern: bot.schedule_pattern || '',
      is_active: bot.is_active
    });
    
    // Parse existing schedule pattern
    const parsed = parseCronPattern(bot.schedule_pattern || '');
    setScheduleType(parsed.type);
    setScheduleTime(parsed.time);
    setScheduleDays(parsed.days);
    
    setShowEditModal(true);
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automated Bots</h1>
          <p className="text-muted-foreground">Loading bots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* No Accounts Alert */}
      {connectedSessions.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  No Connected Accounts
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                  You need a connected WhatsApp account before you can create bots. Get started by creating and connecting an account first.
                </p>
                <Button
                  onClick={() => navigate('/sessions')}
                  variant="default"
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automated Bots</h1>
          <p className="text-muted-foreground">Create and manage message automation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        </div>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No bots yet</h3>
            <p className="text-muted-foreground mb-4">Create your first bot to automate message sending</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => {
            const session = sessions.find(s => s.id === bot.session_id);
            return (
              <Card key={bot.id} className={bot.is_active ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{bot.name}</CardTitle>
                    </div>
                    <Badge variant={bot.is_active ? 'success' : 'secondary'}>
                      {bot.is_active ? <Power className="h-3 w-3 mr-1" /> : <PowerOff className="h-3 w-3 mr-1" />}
                      {bot.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Account:</span>
                      <span className="text-muted-foreground">{session?.session_name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Schedule:</span>
                      <span className="text-muted-foreground">{bot.schedule_pattern || 'Manual only'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Targets:</span>
                      <span className="text-muted-foreground">{bot.target_numbers?.length || 0} numbers</span>
                    </div>
                  </div>

                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-xs font-medium mb-1">Message Template:</p>
                    <p className="text-sm line-clamp-3">{bot.message_template}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleBot(bot)} className="flex-1">
                    {bot.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => triggerBot(bot.id)}>
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditModal(bot)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteBot(bot.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Bot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Create New Bot</CardTitle>
              <CardDescription>Set up an automated messaging bot</CardDescription>
            </CardHeader>
            {connectedSessions.length === 0 ? (
              <CardContent>
                <div className="p-6 text-center bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-yellow-900 dark:text-yellow-100">⚠️ No connected accounts. Please connect an account first.</p>
                </div>
              </CardContent>
            ) : (
              <form onSubmit={createBot}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot Name *</Label>
                    <Input 
                      id="bot-name"
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g., Daily Reminder Bot" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Account *</label>
                    <Select value={formData.session_id} onValueChange={(value) => setFormData({...formData, session_id: value})}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Choose an account" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Connected Accounts</SelectLabel>
                          {connectedSessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.session_name} ({session.phone_number})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message-template">Message Template *</Label>
                    <Textarea 
                      id="message-template"
                      value={formData.message_template} 
                      onChange={(e) => setFormData({...formData, message_template: e.target.value})} 
                      placeholder="Hello! This is an automated message..." 
                      rows={4} 
                      required 
                    />
                    <p className="text-xs text-muted-foreground">Available variables: {'{date}'}, {'{time}'}, {'{day}'}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target-numbers">Target Numbers *</Label>
                    <Input 
                      id="target-numbers"
                      type="text" 
                      value={formData.target_numbers} 
                      onChange={(e) => setFormData({...formData, target_numbers: e.target.value})} 
                      placeholder="1234567890, 0987654321" 
                      required 
                    />
                    <p className="text-xs text-muted-foreground">Enter phone numbers separated by commas</p>
                  </div>

                  {/* User-Friendly Scheduling */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      Schedule Settings
                    </Label>
                    
                    <div className="space-y-3">
                      <Select value={scheduleType} onValueChange={setScheduleType}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose schedule type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Manual Only (No Schedule)
                            </div>
                          </SelectItem>
                          <SelectItem value="daily">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Daily at Specific Time
                            </div>
                          </SelectItem>
                          <SelectItem value="weekly">
                            <div className="flex items-center gap-2">
                              <Timer className="h-4 w-4" />
                              Weekly on Specific Days
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {scheduleType === 'daily' && (
                        <div className="space-y-2">
                          <Label htmlFor="schedule-time">Time</Label>
                          <Input 
                            id="schedule-time"
                            type="time" 
                            value={scheduleTime} 
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">Bot will send messages daily at this time</p>
                        </div>
                      )}

                      {scheduleType === 'weekly' && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="schedule-time-weekly">Time</Label>
                            <Input 
                              id="schedule-time-weekly"
                              type="time" 
                              value={scheduleTime} 
                              onChange={(e) => setScheduleTime(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Days of Week</Label>
                            <div className="grid grid-cols-7 gap-2">
                              {[
                                { value: 0, label: 'Sun' },
                                { value: 1, label: 'Mon' },
                                { value: 2, label: 'Tue' },
                                { value: 3, label: 'Wed' },
                                { value: 4, label: 'Thu' },
                                { value: 5, label: 'Fri' },
                                { value: 6, label: 'Sat' }
                              ].map((day) => (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const newDays = scheduleDays.includes(day.value)
                                      ? scheduleDays.filter(d => d !== day.value)
                                      : [...scheduleDays, day.value];
                                    setScheduleDays(newDays);
                                  }}
                                  className={`p-2 text-xs rounded-md border transition-colors ${
                                    scheduleDays.includes(day.value)
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-background border-border hover:bg-accent'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">Select which days to send messages</p>
                          </div>
                        </div>
                      )}

                      {scheduleType !== 'manual' && (
                        <div className="p-3 bg-accent rounded-lg">
                          <p className="text-sm font-medium mb-1">Schedule Preview:</p>
                          <p className="text-sm text-muted-foreground">
                            {scheduleType === 'daily' && `Daily at ${scheduleTime}`}
                            {scheduleType === 'weekly' && (
                              scheduleDays.length > 0 
                                ? `Weekly on ${scheduleDays.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')} at ${scheduleTime}`
                                : 'Please select at least one day'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" />
                    <span className="text-sm">Activate bot immediately</span>
                  </label>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); resetForm(); }} className="w-full">Cancel</Button>
                  <Button type="submit" className="w-full">Create Bot</Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Edit Bot Modal - Similar structure to Create */}
      {showEditModal && editingBot && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Edit Bot</CardTitle>
              <CardDescription>Update bot configuration</CardDescription>
            </CardHeader>
            <form onSubmit={updateBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-bot-name">Bot Name *</Label>
                  <Input 
                    id="edit-bot-name"
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-message-template">Message Template *</Label>
                  <Textarea 
                    id="edit-message-template"
                    value={formData.message_template} 
                    onChange={(e) => setFormData({...formData, message_template: e.target.value})} 
                    rows={4} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-target-numbers">Target Numbers *</Label>
                  <Input 
                    id="edit-target-numbers"
                    type="text" 
                    value={formData.target_numbers} 
                    onChange={(e) => setFormData({...formData, target_numbers: e.target.value})} 
                    required 
                  />
                </div>
                
                {/* User-Friendly Scheduling for Edit */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Schedule Settings
                  </Label>
                  
                  <div className="space-y-3">
                    <Select value={scheduleType} onValueChange={setScheduleType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose schedule type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Manual Only (No Schedule)
                          </div>
                        </SelectItem>
                        <SelectItem value="daily">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Daily at Specific Time
                          </div>
                        </SelectItem>
                        <SelectItem value="weekly">
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            Weekly on Specific Days
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {scheduleType === 'daily' && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-schedule-time">Time</Label>
                        <Input 
                          id="edit-schedule-time"
                          type="time" 
                          value={scheduleTime} 
                          onChange={(e) => setScheduleTime(e.target.value)}
                        />
                      </div>
                    )}

                    {scheduleType === 'weekly' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="edit-schedule-time-weekly">Time</Label>
                          <Input 
                            id="edit-schedule-time-weekly"
                            type="time" 
                            value={scheduleTime} 
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Days of Week</Label>
                          <div className="grid grid-cols-7 gap-2">
                            {[
                              { value: 0, label: 'Sun' },
                              { value: 1, label: 'Mon' },
                              { value: 2, label: 'Tue' },
                              { value: 3, label: 'Wed' },
                              { value: 4, label: 'Thu' },
                              { value: 5, label: 'Fri' },
                              { value: 6, label: 'Sat' }
                            ].map((day) => (
                              <button
                                key={day.value}
                                type="button"
                                onClick={() => {
                                  const newDays = scheduleDays.includes(day.value)
                                    ? scheduleDays.filter(d => d !== day.value)
                                    : [...scheduleDays, day.value];
                                  setScheduleDays(newDays);
                                }}
                                className={`p-2 text-xs rounded-md border transition-colors ${
                                  scheduleDays.includes(day.value)
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background border-border hover:bg-accent'
                                }`}
                              >
                                {day.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Bot is active</span>
                </label>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingBot(null); resetForm(); }} className="w-full">Cancel</Button>
                <Button type="submit" className="w-full">Update Bot</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Bots;
