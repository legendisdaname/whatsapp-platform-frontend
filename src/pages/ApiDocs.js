import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BookOpen,
  Key,
  Code,
  Copy,
  CheckCircle,
  ExternalLink,
  Terminal,
  Send,
  MessageSquare,
  Bot,
  Users,
  Settings,
  FileText,
  ChevronRight,
  Lock
} from 'lucide-react';

function ApiDocs() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [apiKey, setApiKey] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const response = await api.get('/api/api-keys/current');
      if (response.data.success && response.data.data.apiKey) {
        setApiKey(response.data.data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  };

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const CodeBlock = ({ code, language, id }) => (
    <div className="relative group">
      <pre className="bg-muted border border-border p-4 rounded-lg overflow-x-auto text-sm">
        <code className="text-foreground font-mono">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-2 right-2 p-2 bg-background border border-border hover:bg-accent rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );

  const EndpointCard = ({ method, path, description, authRequired = true, requestBody, responseExample }) => (
    <Card className="mb-4">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Badge 
            variant={method === 'GET' ? 'default' : method === 'POST' ? 'success' : method === 'DELETE' ? 'destructive' : 'secondary'}
            className="font-mono"
          >
            {method}
          </Badge>
          <div className="flex-1">
            <code className="text-sm font-mono bg-accent px-2 py-1 rounded">{path}</code>
            {authRequired && (
              <Badge variant="outline" className="ml-2">
                <Lock className="h-3 w-3 mr-1" />
                Auth Required
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {requestBody && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Request Body</h4>
            <CodeBlock 
              code={JSON.stringify(requestBody, null, 2)}
              language="json"
              id={`req-${path}`}
            />
          </div>
        )}
        
        {responseExample && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Response</h4>
            <CodeBlock 
              code={JSON.stringify(responseExample, null, 2)}
              language="json"
              id={`res-${path}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const sections = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'sessions', label: 'Accounts', icon: MessageSquare },
    { id: 'messages', label: 'Messages', icon: Send },
    { id: 'bots', label: 'Bots', icon: Bot },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'examples', label: 'Code Examples', icon: Code },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">
            Complete reference for the WhatsApp Platform API
          </p>
        </div>
        <Button variant="outline" onClick={() => window.open('http://localhost:5000/api-docs', '_blank')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Swagger Docs
        </Button>
      </div>

      {/* API Key Banner */}
      {!apiKey && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  You need an API key to use the API
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Go to Settings → API Keys to generate your API key
                </p>
              </div>
              <Button size="sm" onClick={() => window.location.href = '/settings'}>
                Get API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to the WhatsApp Platform API</CardTitle>
                  <CardDescription>
                    RESTful API for managing WhatsApp accounts, sending messages, and automating workflows
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Base URL</h3>
                    <code className="block bg-accent p-3 rounded text-sm">
                      http://localhost:5000/api
                    </code>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">Create and manage WhatsApp Web accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">Send messages to individuals and groups</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">Create automated bots with scheduled messaging</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">Manage contacts and groups</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                        <span className="text-sm">Multi-user support with user-specific data isolation</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Response Format</h3>
                    <p className="text-sm text-muted-foreground mb-2">All responses are in JSON format:</p>
                    <CodeBlock
                      code={`{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}`}
                      language="json"
                      id="response-format"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Authentication Section */}
          {activeSection === 'authentication' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>
                    The API supports two authentication methods: JWT tokens and API keys
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Method 1: API Key (Recommended)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use your API key in the request headers. Get your API key from Settings → API Keys.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Option A: x-api-key header</h4>
                        <CodeBlock
                          code={`curl -H "x-api-key: ${apiKey || 'wp_live_your_api_key_here'}" \\
  http://localhost:5000/api/sessions`}
                          language="bash"
                          id="auth-api-key-1"
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Option B: Authorization header</h4>
                        <CodeBlock
                          code={`curl -H "Authorization: Bearer ${apiKey || 'wp_live_your_api_key_here'}" \\
  http://localhost:5000/api/sessions`}
                          language="bash"
                          id="auth-api-key-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Method 2: JWT Token
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Obtain a JWT token by logging in, then include it in subsequent requests.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">1. Login to get token</h4>
                        <CodeBlock
                          code={`curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'`}
                          language="bash"
                          id="auth-login"
                        />
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">2. Use token in requests</h4>
                        <CodeBlock
                          code={`curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  http://localhost:5000/api/sessions`}
                          language="bash"
                          id="auth-jwt"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Accounts Section */}
          {activeSection === 'sessions' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    Create and manage WhatsApp Web accounts for your user
                  </CardDescription>
                </CardHeader>
              </Card>

              <EndpointCard
                method="GET"
                path="/api/sessions"
                description="Get all accounts for the authenticated user"
                responseExample={{
                  success: true,
                  data: [
                    {
                      id: "uuid",
                      session_name: "My Session",
                      phone_number: "+1234567890",
                      status: "connected",
                      created_at: "2025-01-01T00:00:00Z"
                    }
                  ]
                }}
              />

              <EndpointCard
                method="POST"
                path="/api/sessions"
                description="Create a new WhatsApp account"
                requestBody={{
                  sessionName: "My New Account"
                }}
                responseExample={{
                  success: true,
                  message: "Account created successfully",
                  data: {
                    id: "uuid",
                    session_name: "My New Account",
                    qr: "data:image/png;base64,...",
                    status: "initializing"
                  }
                }}
              />

              <EndpointCard
                method="GET"
                path="/api/sessions/:id"
                description="Get details of a specific account"
                responseExample={{
                  success: true,
                  data: {
                    id: "uuid",
                    session_name: "My Account",
                    phone_number: "+1234567890",
                    status: "connected",
                    created_at: "2025-01-01T00:00:00Z"
                  }
                }}
              />

              <EndpointCard
                method="DELETE"
                path="/api/sessions/:id"
                description="Delete an account and disconnect it"
                responseExample={{
                  success: true,
                  message: "Account deleted successfully"
                }}
              />
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messaging</CardTitle>
                  <CardDescription>
                    Send messages to individuals and groups through your WhatsApp accounts
                  </CardDescription>
                </CardHeader>
              </Card>

              <EndpointCard
                method="POST"
                path="/api/messages/send"
                description="Send a message to an individual or group"
                requestBody={{
                  sessionId: "session-uuid",
                  recipientType: "individual",
                  recipientNumber: "1234567890",
                  message: "Hello from API!"
                }}
                responseExample={{
                  success: true,
                  message: "Message sent successfully",
                  data: {
                    messageId: "message_id",
                    timestamp: 1234567890
                  }
                }}
              />

              <EndpointCard
                method="GET"
                path="/api/messages/history/:sessionId"
                description="Get message history for an account"
                responseExample={{
                  success: true,
                  data: [
                    {
                      id: "uuid",
                      recipient: "1234567890",
                      message: "Hello!",
                      status: "sent",
                      timestamp: "2025-01-01T00:00:00Z"
                    }
                  ]
                }}
              />

              <EndpointCard
                method="GET"
                path="/api/messages/received/:sessionId"
                description="Get received messages for an account"
                responseExample={{
                  success: true,
                  data: [
                    {
                      from: "1234567890",
                      message: "Hi there!",
                      timestamp: "2025-01-01T00:00:00Z"
                    }
                  ]
                }}
              />
            </div>
          )}

          {/* Bots Section */}
          {activeSection === 'bots' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Bots</CardTitle>
                  <CardDescription>
                    Create and manage automated messaging bots
                  </CardDescription>
                </CardHeader>
              </Card>

              <EndpointCard
                method="GET"
                path="/api/bots"
                description="Get all bots for the authenticated user"
                responseExample={{
                  success: true,
                  data: [
                    {
                      id: "uuid",
                      name: "Daily Reminder",
                      session_id: "session-uuid",
                      message_template: "Good morning!",
                      schedule_type: "interval",
                      interval_minutes: 1440,
                      active: true
                    }
                  ]
                }}
              />

              <EndpointCard
                method="POST"
                path="/api/bots"
                description="Create a new automated bot"
                requestBody={{
                  session_id: "session-uuid",
                  name: "My Bot",
                  message_template: "Hello {{name}}!",
                  schedule_type: "interval",
                  interval_minutes: 60,
                  target_type: "group",
                  target_group_id: "group-uuid",
                  active: true
                }}
                responseExample={{
                  success: true,
                  message: "Bot created successfully",
                  data: {
                    id: "uuid",
                    name: "My Bot",
                    active: true
                  }
                }}
              />

              <EndpointCard
                method="PUT"
                path="/api/bots/:id"
                description="Update a bot's configuration"
                requestBody={{
                  name: "Updated Bot Name",
                  active: false
                }}
                responseExample={{
                  success: true,
                  message: "Bot updated successfully"
                }}
              />

              <EndpointCard
                method="DELETE"
                path="/api/bots/:id"
                description="Delete a bot"
                responseExample={{
                  success: true,
                  message: "Bot deleted successfully"
                }}
              />
            </div>
          )}

          {/* Contacts Section */}
          {activeSection === 'contacts' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contacts & Groups</CardTitle>
                  <CardDescription>
                    Manage your contacts and contact groups
                  </CardDescription>
                </CardHeader>
              </Card>

              <EndpointCard
                method="GET"
                path="/api/contacts"
                description="Get all contacts for the authenticated user"
                responseExample={{
                  success: true,
                  data: [
                    {
                      id: "uuid",
                      name: "John Doe",
                      phone_number: "1234567890",
                      email: "john@example.com",
                      tags: ["customer", "vip"]
                    }
                  ]
                }}
              />

              <EndpointCard
                method="POST"
                path="/api/contacts"
                description="Add a new contact"
                requestBody={{
                  name: "Jane Smith",
                  phone_number: "9876543210",
                  email: "jane@example.com",
                  tags: ["lead"]
                }}
                responseExample={{
                  success: true,
                  message: "Contact added successfully",
                  data: {
                    id: "uuid",
                    name: "Jane Smith"
                  }
                }}
              />

              <EndpointCard
                method="GET"
                path="/api/contacts/groups"
                description="Get all contact groups"
                responseExample={{
                  success: true,
                  data: [
                    {
                      id: "uuid",
                      name: "VIP Customers",
                      description: "High-value customers",
                      contact_count: 25
                    }
                  ]
                }}
              />

              <EndpointCard
                method="POST"
                path="/api/contacts/groups"
                description="Create a new contact group"
                requestBody={{
                  name: "Newsletter Subscribers",
                  description: "People subscribed to newsletter"
                }}
                responseExample={{
                  success: true,
                  message: "Group created successfully",
                  data: {
                    id: "uuid",
                    name: "Newsletter Subscribers"
                  }
                }}
              />
            </div>
          )}

          {/* Examples Section */}
          {activeSection === 'examples' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>
                    Ready-to-use code snippets in different programming languages
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* JavaScript Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">JavaScript / Node.js</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Install Axios</h4>
                    <CodeBlock
                      code="npm install axios"
                      language="bash"
                      id="js-install"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Example: Send Message</h4>
                    <CodeBlock
                      code={`const axios = require('axios');

const API_KEY = '${apiKey || 'wp_live_your_api_key_here'}';
const BASE_URL = 'http://localhost:5000/api';

async function sendMessage() {
  try {
    const response = await axios.post(
      \`\${BASE_URL}/messages/send\`,
      {
        sessionId: 'your-session-id',
        recipientType: 'individual',
        recipientNumber: '1234567890',
        message: 'Hello from Node.js!'
      },
      {
        headers: {
          'x-api-key': API_KEY
        }
      }
    );
    
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

sendMessage();`}
                      language="javascript"
                      id="js-example"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Python Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Python</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Install Requests</h4>
                    <CodeBlock
                      code="pip install requests"
                      language="bash"
                      id="py-install"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Example: Get Sessions</h4>
                    <CodeBlock
                      code={`import requests

API_KEY = '${apiKey || 'wp_live_your_api_key_here'}'
BASE_URL = 'http://localhost:5000/api'

def get_sessions():
    headers = {
        'x-api-key': API_KEY
    }
    
    response = requests.get(
        f'{BASE_URL}/sessions',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print('Sessions:', data)
    else:
        print('Error:', response.text)

get_sessions()`}
                      language="python"
                      id="py-example"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PHP Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">PHP</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Example: Create Bot</h4>
                    <CodeBlock
                      code={`<?php

$apiKey = '${apiKey || 'wp_live_your_api_key_here'}';
$baseUrl = 'http://localhost:5000/api';

$data = array(
    'session_id' => 'your-session-id',
    'name' => 'My PHP Bot',
    'message_template' => 'Hello from PHP!',
    'schedule_type' => 'interval',
    'interval_minutes' => 60,
    'target_type' => 'individual',
    'target_number' => '1234567890',
    'active' => true
);

$options = array(
    'http' => array(
        'header'  => "Content-Type: application/json\\r\\n" .
                     "x-api-key: $apiKey\\r\\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    )
);

$context = stream_context_create($options);
$result = file_get_contents("$baseUrl/bots", false, $context);

echo $result;

?>`}
                      language="php"
                      id="php-example"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* cURL Example */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">cURL (Command Line)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Example: List Contacts</h4>
                    <CodeBlock
                      code={`curl -X GET http://localhost:5000/api/contacts \\
  -H "x-api-key: ${apiKey || 'wp_live_your_api_key_here'}"`}
                      language="bash"
                      id="curl-example"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiDocs;

