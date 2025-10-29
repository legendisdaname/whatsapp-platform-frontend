import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sessionAPI } from '../api/api';
import api from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Textarea } from '../components/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '../components/ui/Select';
import {
  ShoppingCart,
  Store,
  Key,
  MessageSquare,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Bell,
  Settings as SettingsIcon,
  Loader2,
  Package,
  ArrowRight,
  ArrowLeft,
  Plug,
  Check,
  Plus
} from 'lucide-react';

function WooCommerce() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [setupStep, setSetupStep] = useState(0); // 0 = check status, 1 = store URL, 2 = account, 3 = done
  const [sessions, setSessions] = useState([]);
  const [settings, setSettings] = useState({
    store_url: '',
    consumer_key: '',
    consumer_secret: '',
    session_id: '',
    order_created_template: '',
    order_processing_template: '',
    order_completed_template: '',
    enabled: true
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, settingsRes] = await Promise.all([
        sessionAPI.getAll(),
        api.get('/api/woocommerce/settings').catch(err => ({ data: { settings: null } })) // Graceful fallback
      ]);

      setSessions(sessionsRes.data.sessions || []);
      
      if (settingsRes.data.settings) {
        const loadedSettings = settingsRes.data.settings;
        setSettings({
          ...settings,
          ...loadedSettings
        });
        setIsConfigured(true);
        setSetupStep(3); // Already configured
      } else {
        setIsConfigured(false);
        setSetupStep(1); // Start setup
      }

      // Try to fetch notifications, but don't fail if it doesn't work
      try {
        const notificationsRes = await api.get('/api/woocommerce/notifications?limit=10');
        setNotifications(notificationsRes.data.notifications || []);
      } catch (notifError) {
        console.log('Notifications not available yet:', notifError.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMsg = error.response?.data?.error || error.message || '';
      if (errorMsg.includes('relation') || errorMsg.includes('table')) {
        showMessage('error', 'Database tables not found. Please set up the WooCommerce integration first.');
      } else {
        showMessage('error', 'Failed to load data. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Ensure user is logged in
      if (!user || !user.id) {
        showMessage('error', 'Please log in to continue');
        navigate('/login');
        return;
      }
      
      // Add user_id to settings
      const settingsWithUser = {
        ...settings,
        user_id: user.id
      };
      
      console.log('Saving WooCommerce settings:', { userId: user.id, settings: settingsWithUser });
      
      const response = await api.post('/api/woocommerce/settings', settingsWithUser);
      
      if (response.data.success) {
        showMessage('success', 'WooCommerce connected successfully! 🎉');
        setIsConfigured(true);
        setSetupStep(3);
        fetchData();
      } else {
        throw new Error(response.data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save settings. Please try again.';
      showMessage('error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (setupStep === 1 && !settings.store_url) {
      showMessage('error', 'Please enter your store URL');
      return;
    }
    if (setupStep === 2 && !settings.session_id) {
      showMessage('error', 'Please select a WhatsApp account');
      return;
    }
    setSetupStep(setupStep + 1);
  };

  const completeSetup = async () => {
    await saveSettings();
  };

  const testIntegration = async () => {
    if (!testPhone) {
      showMessage('error', 'Please enter a phone number to test');
      return;
    }

    try {
      setTesting(true);
      await api.post('/api/woocommerce/test', { phone_number: testPhone });
      showMessage('success', 'Test message sent! Check your WhatsApp.');
      setTestPhone('');
    } catch (error) {
      console.error('Error testing integration:', error);
      showMessage('error', error.response?.data?.error || 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const copyWebhookUrl = (endpoint) => {
    const url = `${window.location.origin}/api/woocommerce/${endpoint}`;
    navigator.clipboard.writeText(url);
    showMessage('success', 'Webhook URL copied to clipboard!');
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  const defaultTemplates = {
    order_created: `Hello {customer_name}! 🎉

Thank you for your order!

📦 Order #{order_number}
💰 Total: {currency} {total}
📅 Date: {order_date}

Items:
{items}

We'll keep you updated on your order status!

Thank you for shopping with us! ❤️`,
    order_processing: `Hello {customer_name}! 📦

Your order #{order_number} is now being processed!

We're preparing your items and will notify you once shipped.

Total: {currency} {total}

Thanks for your patience!`,
    order_completed: `Hello {customer_name}! 🎉

Great news! Your order #{order_number} has been completed!

We hope you enjoy your purchase! ❤️

Total: {currency} {total}

Thank you for shopping with us!`
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Database Setup Required
  if (message.text && message.type === 'error' && message.text.includes('database')) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Database Setup Required</h1>
          <p className="text-muted-foreground">
            The WooCommerce integration needs database tables to be created first
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Quick Database Setup
            </CardTitle>
            <CardDescription>
              Follow these steps to set up the WooCommerce integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">1</div>
                <div>
                  <p className="font-medium">Open Supabase Dashboard</p>
                  <p className="text-sm text-muted-foreground">Go to your Supabase project dashboard</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">2</div>
                <div>
                  <p className="font-medium">Go to SQL Editor</p>
                  <p className="text-sm text-muted-foreground">Click on "SQL Editor" in the left sidebar</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center text-sm font-semibold shrink-0">3</div>
                <div>
                  <p className="font-medium">Run the SQL</p>
                  <p className="text-sm text-muted-foreground">Copy and paste the SQL below</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Copy this SQL:</p>
              <code className="text-xs bg-background p-2 rounded block overflow-x-auto">
                CREATE TABLE IF NOT EXISTS woocommerce_settings ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, store_url TEXT NOT NULL, consumer_key TEXT, consumer_secret TEXT, session_id UUID REFERENCES sessions(id), order_created_template TEXT, order_processing_template TEXT, order_completed_template TEXT, order_hold_template TEXT, order_cancelled_template TEXT, order_status_change_template TEXT, enabled BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW() ); CREATE TABLE IF NOT EXISTS woocommerce_notifications ( id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID REFERENCES users(id) ON DELETE CASCADE, order_id VARCHAR(255), order_number VARCHAR(255), customer_phone VARCHAR(50), message_sent TEXT, status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'failed')), error_message TEXT, created_at TIMESTAMPTZ DEFAULT NOW() ); CREATE INDEX IF NOT EXISTS idx_woocommerce_settings_user_id ON woocommerce_settings(user_id); CREATE INDEX IF NOT EXISTS idx_woocommerce_notifications_user_id ON woocommerce_notifications(user_id); ALTER TABLE woocommerce_settings ENABLE ROW LEVEL SECURITY; ALTER TABLE woocommerce_notifications ENABLE ROW LEVEL SECURITY; CREATE POLICY IF NOT EXISTS "Allow all operations on woocommerce_settings" ON woocommerce_settings FOR ALL USING (true); CREATE POLICY IF NOT EXISTS "Allow all operations on woocommerce_notifications" ON woocommerce_notifications FOR ALL USING (true);
              </code>
            </div>

            <Button onClick={() => { setMessage({ type: '', text: '' }); fetchData(); }} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again After Setup
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Easy Setup Wizard
  if (!isConfigured && setupStep > 0 && setupStep < 3) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Connect Your WooCommerce Store</h1>
          <p className="text-muted-foreground">
            Simple 2-step setup to start sending order notifications via WhatsApp
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2].map((step) => (
            <React.Fragment key={step}>
              <div className={`flex items-center gap-2 ${setupStep >= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold ${
                  setupStep > step ? 'bg-primary text-primary-foreground' : 
                  setupStep === step ? 'border-2 border-primary' : 
                  'border-2 border-muted'
                }`}>
                  {setupStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {step === 1 ? 'Store Info' : 'WhatsApp Account'}
                </span>
              </div>
              {step < 2 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`p-4 rounded-lg border animate-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100' 
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Step 1: Store URL */}
        {setupStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Step 1: Enter Your Store URL
              </CardTitle>
              <CardDescription>
                We'll automatically connect to your WooCommerce store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-3">
                <Label htmlFor="store-url">WooCommerce Store URL *</Label>
                <Input
                  id="store-url"
                  type="url"
                  value={settings.store_url}
                  onChange={(e) => setSettings({...settings, store_url: e.target.value})}
                  placeholder="https://yourstore.com"
                  icon={<Store className="h-4 w-4" />}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://example.com or https://shop.example.com
                </p>
              </div>

              <div className="p-4 bg-accent rounded-lg">
                <p className="text-sm font-semibold mb-2">What happens next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                    We'll generate a WordPress plugin for you
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                    You install it on your site (takes 2 minutes)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-primary" />
                    Your store connects automatically
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Step 2: Select WhatsApp Account */}
        {setupStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Step 2: Choose WhatsApp Account
              </CardTitle>
              <CardDescription>
                Select which WhatsApp account will send order notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedSessions.length === 0 ? (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    No Connected Accounts
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                    You need a connected WhatsApp account to send order notifications
                  </p>
                  <Button onClick={() => navigate('/sessions')} variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    Create WhatsApp Account
                  </Button>
                </div>
              ) : (
                <div className="grid w-full items-center gap-3">
                  <Label htmlFor="session-select">Select WhatsApp Account *</Label>
                  <Select
                    value={settings.session_id}
                    onValueChange={(value) => setSettings({...settings, session_id: value})}
                  >
                    <SelectTrigger>
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
              )}

              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-1">
                      Almost Done!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      After you complete this step, we'll provide you with a simple WordPress plugin to install
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSetupStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={completeSetup} 
                disabled={!settings.session_id || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plug className="mr-2 h-4 w-4" />
                    Connect Store
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    );
  }

  // Main configured view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            WooCommerce Integration
          </h1>
          <p className="text-muted-foreground">
            Send automatic WhatsApp notifications for WooCommerce orders
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Connected
          </Badge>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg border animate-in slide-in-from-top-2 duration-300 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100' 
            : 'bg-destructive/10 border-destructive/20 text-destructive'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Store Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Connected Store</CardTitle>
                <CardDescription>{settings.store_url}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setIsConfigured(false); setSetupStep(1); }}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Reconfigure
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">WhatsApp Account</p>
                <p className="text-xs text-muted-foreground">
                  {sessions.find(s => s.id === settings.session_id)?.session_name || 'Not selected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
              <Bell className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium text-sm">Auto Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {settings.enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WordPress Plugin Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            WordPress Plugin
          </CardTitle>
          <CardDescription>
            Install this plugin on your WordPress site for automatic connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">WhatsApp Order Notifications Plugin</h3>
                <p className="text-sm text-muted-foreground">
                  This plugin automatically sends WhatsApp notifications when orders are placed or updated
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button className="w-full" onClick={() => {
                try {
                  // Download the plugin file
                  const link = document.createElement('a');
                  link.href = '/wordpress-plugin.zip';
                  link.download = 'whatsapp-order-notifications.zip';
                  link.target = '_blank';
                  
                  // Add error handling
                  link.onerror = () => {
                    showMessage('error', 'Download failed. Please try refreshing the page and try again.');
                  };
                  
                  // Trigger download
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  showMessage('success', 'Plugin downloaded! Install it in WordPress → Plugins → Add New → Upload');
                } catch (error) {
                  console.error('Download error:', error);
                  showMessage('error', 'Download failed. Please try again.');
                }
              }}>
                <Package className="mr-2 h-4 w-4" />
                Download WordPress Plugin
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">OR</p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const autoConfigUrl = `${settings.store_url}/wp-admin/admin.php?page=whatsapp-notifications&whatsapp_auto_setup=1&api_url=${encodeURIComponent(window.location.origin)}&session_id=${encodeURIComponent(settings.session_id)}`;
                      window.open(autoConfigUrl, '_blank');
                      showMessage('success', 'Opening auto-configuration page. Login to your WordPress admin if prompted.');
                    }}
                  >
                    <Plug className="mr-2 h-4 w-4" />
                    Auto-Configure Plugin (If Already Installed)
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // Alternative download method - direct file content
                      const pluginContent = `<?php
/**
 * Plugin Name: Streamfinitytv WhatsApp - Order Notifications
 * Plugin URI: https://streamfinitytv.com
 * Description: Send automatic WhatsApp notifications for WooCommerce orders using Streamfinitytv WhatsApp. Professional e-commerce messaging solution.
 * Version: 1.0.0
 * Author: Streamfinitytv WhatsApp
 * Author URI: https://streamfinitytv.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * WC requires at least: 3.0
 * WC tested up to: 8.0
 * Network: false
 * Text Domain: whatsapp-platform
 */

if (!defined('ABSPATH')) {
    exit;
}

class WhatsApp_Order_Notifications {
    
    private $api_url;
    private $session_id;
    
    public function __construct() {
        $this->api_url = get_option('whatsapp_api_url', '');
        $this->session_id = get_option('whatsapp_session_id', '');
        
        add_action('woocommerce_new_order', array($this, 'send_new_order_notification'), 10, 1);
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    public function send_new_order_notification($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $phone = $this->format_phone($order->get_billing_phone());
        if (!$phone) return;
        
        $message = "Hello " . $order->get_billing_first_name() . "! 🎉\\n\\nThank you for your order!\\n\\n📦 Order #" . $order->get_order_number() . "\\n💰 Total: " . $order->get_currency() . " " . $order->get_total() . "\\n\\nThank you for shopping with us! ❤️";
        
        $this->send_whatsapp_message($phone, $message);
    }
    
    private function send_whatsapp_message($phone, $message) {
        if (empty($this->api_url) || empty($this->session_id)) return false;
        
        $response = wp_remote_post($this->api_url . '/api/messages/send', array(
            'headers' => array('Content-Type' => 'application/json'),
            'body' => json_encode(array(
                'sessionId' => $this->session_id,
                'to' => $phone,
                'message' => $message
            )),
            'timeout' => 30
        ));
        
        return !is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200;
    }
    
    private function format_phone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) === 10) $phone = '1' . $phone;
        return $phone;
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce',
            'WhatsApp Notifications',
            'WhatsApp',
            'manage_woocommerce',
            'whatsapp-notifications',
            array($this, 'settings_page')
        );
    }
    
    public function register_settings() {
        register_setting('whatsapp_notifications', 'whatsapp_api_url');
        register_setting('whatsapp_notifications', 'whatsapp_session_id');
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('whatsapp_api_url', sanitize_url($_POST['whatsapp_api_url']));
            update_option('whatsapp_session_id', sanitize_text_field($_POST['whatsapp_session_id']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $api_url = get_option('whatsapp_api_url', '${window.location.origin}');
        $session_id = get_option('whatsapp_session_id', '${settings.session_id}');
        
        echo '<div class="wrap"><h1>WhatsApp Notifications</h1>';
        echo '<form method="post">';
        echo '<table class="form-table">';
        echo '<tr><th>API URL</th><td><input type="url" name="whatsapp_api_url" value="' . esc_attr($api_url) . '" class="regular-text" /></td></tr>';
        echo '<tr><th>Session ID</th><td><input type="text" name="whatsapp_session_id" value="' . esc_attr($session_id) . '" class="regular-text" /></td></tr>';
        echo '</table>';
        echo '<p class="submit"><input type="submit" name="submit" class="button-primary" value="Save Settings" /></p>';
        echo '</form></div>';
    }
}

new WhatsApp_Order_Notifications();`;
                      
                      // Create and download the file
                      const blob = new Blob([pluginContent], { type: 'text/php' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'whatsapp-order-notifications.php';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                      
                      showMessage('success', 'Plugin file downloaded! Upload it to WordPress → Plugins → Add New → Upload Plugin');
                    }}
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Download Plugin File (Alternative)
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm font-semibold mb-3">Installation Steps:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li className="flex items-start gap-2">
                <span className="shrink-0">1.</span>
                <span>Download the plugin using the button above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">2.</span>
                <span>Go to your WordPress admin: Plugins → Add New → Upload Plugin</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">3.</span>
                <span>Choose the downloaded file and click "Install Now"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">4.</span>
                <span>Click "Activate Plugin"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="shrink-0">5.</span>
                <span>The plugin will automatically connect to your Streamfinitytv WhatsApp! ✅</span>
              </li>
            </ol>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-1">Webhook URL (Backup)</p>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {window.location.origin}/api/woocommerce/order-created
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyWebhookUrl('order-created')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="text-sm font-medium mb-1">Status Change URL</p>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {window.location.origin}/api/woocommerce/order-status-changed
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyWebhookUrl('order-status-changed')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Message Templates
          </CardTitle>
          <CardDescription>
            Customize the messages sent to customers. Use variables like {'{customer_name}'}, {'{order_number}'}, {'{total}'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order Created Template */}
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="template-created">Order Created Template</Label>
            <Textarea
              id="template-created"
              value={settings.order_created_template || defaultTemplates.order_created}
              onChange={(e) => setSettings({...settings, order_created_template: e.target.value})}
              rows={8}
              placeholder={defaultTemplates.order_created}
            />
          </div>

          {/* Order Processing Template */}
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="template-processing">Order Processing Template</Label>
            <Textarea
              id="template-processing"
              value={settings.order_processing_template || defaultTemplates.order_processing}
              onChange={(e) => setSettings({...settings, order_processing_template: e.target.value})}
              rows={6}
              placeholder={defaultTemplates.order_processing}
            />
          </div>

          {/* Order Completed Template */}
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="template-completed">Order Completed Template</Label>
            <Textarea
              id="template-completed"
              value={settings.order_completed_template || defaultTemplates.order_completed}
              onChange={(e) => setSettings({...settings, order_completed_template: e.target.value})}
              rows={6}
              placeholder={defaultTemplates.order_completed}
            />
          </div>

          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm font-semibold mb-2">Available Variables:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <code>{'{customer_name}'}</code>
              <code>{'{order_number}'}</code>
              <code>{'{total}'}</code>
              <code>{'{currency}'}</code>
              <code>{'{status}'}</code>
              <code>{'{order_date}'}</code>
              <code>{'{items}'}</code>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Templates'}
          </Button>
        </CardFooter>
      </Card>

      {/* Test Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Test Integration
          </CardTitle>
          <CardDescription>
            Send a test order notification to verify everything is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="test-phone">Test Phone Number</Label>
            <Input
              id="test-phone"
              type="tel"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="1234567890 (with country code)"
              icon={<MessageSquare className="h-4 w-4" />}
            />
            <p className="text-xs text-muted-foreground">
              Enter a phone number to receive a test order notification
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={testIntegration}
            disabled={testing || !testPhone || !settings.session_id}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Send Test Notification
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            Last 10 order notifications sent via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Order #{notif.order_number}</p>
                    <p className="text-sm text-muted-foreground">{notif.customer_phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={notif.status === 'sent' ? 'success' : 'destructive'}>
                    {notif.status === 'sent' ? (
                      <><CheckCircle className="mr-1 h-3 w-3" /> Sent</>
                    ) : (
                      <><XCircle className="mr-1 h-3 w-3" /> Failed</>
                    )}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default WooCommerce;

