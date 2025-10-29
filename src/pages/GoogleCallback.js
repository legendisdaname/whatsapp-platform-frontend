import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Google login was cancelled or failed');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (code) {
        try {
          await handleGoogleCallback(code);
          navigate('/');
        } catch (error) {
          console.error('Google callback error:', error);
          setError(error.message || 'Google login failed');
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('No authorization code received');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground mx-auto animate-pulse">
          <MessageSquare className="h-8 w-8" />
        </div>
        
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-destructive">Authentication Failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold">Completing Google Sign In...</h2>
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Please wait while we log you in</p>
          </>
        )}
      </div>
    </div>
  );
}

export default GoogleCallback;

