import React from 'react';
import { AlertTriangle, Mail, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useState } from 'react';

const BlockedUserMessage = ({ user }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !user || !user.is_blocked) {
    return null;
  }

  const handleContactSupport = () => {
    window.open(`mailto:support@whatsappplatform.com?subject=Account Blocked - ${user.email}&body=Hello, my account has been blocked and I would like to request a review. Account ID: ${user.id}`);
  };

  return (
    <Card className="border-destructive/30 bg-destructive/5 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-destructive flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-destructive">Account Blocked</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your account has been blocked by an administrator
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your account access has been restricted. If you believe this is an error, please contact our support team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactSupport}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p><strong>Account:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id.slice(0, 8)}...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockedUserMessage;
