import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionAPI, botAPI } from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import BlockedUserMessage from '../components/BlockedUserMessage';
import { 
  MessageSquare, 
  Bot, 
  Send, 
  Users,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  ShoppingCart
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalBots: 0,
    activeBots: 0,
    messagesSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions
      const sessionsResponse = await sessionAPI.getAll();
      const sessions = sessionsResponse.data.sessions || [];
      const activeSessions = sessions.filter(s => s.status === 'connected').length;

      // Fetch bots
      const botsResponse = await botAPI.getAll();
      const bots = botsResponse.data.bots || [];
      const activeBots = bots.filter(b => b.is_active).length;

      setStats({
        totalSessions: sessions.length,
        activeSessions: activeSessions,
        totalBots: bots.length,
        activeBots: activeBots,
        messagesSent: 0 // Would need to aggregate from all sessions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Accounts',
      value: stats.totalSessions,
      icon: MessageSquare,
      description: 'WhatsApp accounts',
      trend: '+12% from last month',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Accounts',
      value: stats.activeSessions,
      icon: Activity,
      description: 'Currently connected',
      trend: `${stats.activeSessions}/${stats.totalSessions} online`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Bots',
      value: stats.totalBots,
      icon: Bot,
      description: 'Automated bots',
      trend: '+5 this week',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Active Bots',
      value: stats.activeBots,
      icon: CheckCircle,
      description: 'Running bots',
      trend: `${stats.activeBots}/${stats.totalBots} active`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const quickActions = [
    {
      title: 'Create Account',
      description: 'Set up a new WhatsApp account',
      icon: MessageSquare,
      action: () => navigate('/sessions'),
      variant: 'default',
    },
    {
      title: 'Create Bot',
      description: 'Automate message sending',
      icon: Bot,
      action: () => navigate('/bots'),
      variant: 'outline',
    },
    {
      title: 'Send Message',
      description: 'Send instant messages',
      icon: Send,
      action: () => navigate('/messages'),
      variant: 'outline',
    },
    {
      title: 'Manage Contacts',
      description: 'Organize your contacts',
      icon: Users,
      action: () => navigate('/contacts'),
      variant: 'outline',
    },
    {
      title: 'WooCommerce',
      description: 'Connect your store',
      icon: ShoppingCart,
      action: () => navigate('/woocommerce'),
      variant: 'outline',
    },
  ];

  const features = [
    {
      title: 'Multi-Session Support',
      description: 'Manage multiple WhatsApp accounts simultaneously',
      icon: MessageSquare,
    },
    {
      title: 'Automated Messaging',
      description: 'Schedule and automate your message campaigns',
      icon: Clock,
    },
    {
      title: 'Contact Management',
      description: 'Organize contacts into groups for easy targeting',
      icon: Users,
    },
    {
      title: 'Real-time Monitoring',
      description: 'Track message delivery and session health',
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading your statistics...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your Streamfinitytv WhatsApp.
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <Activity className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Blocked User Message */}
      {user && <BlockedUserMessage user={user} />}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with these common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const isBlocked = user?.is_blocked;
              return (
                <button
                  key={index}
                  onClick={isBlocked ? null : action.action}
                  disabled={isBlocked}
                  className={`flex flex-col items-start p-4 space-y-2 text-left transition-colors border rounded-lg ${
                    isBlocked 
                      ? 'opacity-50 cursor-not-allowed bg-muted' 
                      : 'hover:bg-accent cursor-pointer group'
                  }`}
                  title={isBlocked ? 'Action disabled - Account is blocked' : ''}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className={`font-medium ${isBlocked ? '' : 'group-hover:text-primary'} transition-colors`}>
                      {action.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className={`h-4 w-4 ml-auto text-muted-foreground ${isBlocked ? '' : 'group-hover:text-primary group-hover:translate-x-1'} transition-all`} />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Getting Started & Features */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Follow these steps to start using the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div className="space-y-1">
                <p className="font-medium">Create a Session</p>
                <p className="text-sm text-muted-foreground">
                  Go to Accounts and create a new WhatsApp account
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <div className="space-y-1">
                <p className="font-medium">Scan QR Code</p>
                <p className="text-sm text-muted-foreground">
                  Use WhatsApp mobile app to scan the generated QR code
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <div className="space-y-1">
                <p className="font-medium">Start Messaging</p>
                <p className="text-sm text-muted-foreground">
                  Send messages or create automated bots
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/sessions')} className="w-full mt-4">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
            <CardDescription>
              Everything you need for WhatsApp automation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      {stats.activeSessions === 0 && stats.totalSessions > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">
                  No Active Accounts
                </p>
                <p className="text-sm text-yellow-700">
                  You have {stats.totalSessions} account(s) but none are currently connected. 
                  Check your accounts and reconnect.
                </p>
              </div>
              <Button
                onClick={() => navigate('/sessions')}
                variant="outline"
                size="sm"
              >
                View Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;

