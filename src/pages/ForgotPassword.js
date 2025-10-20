import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MessageSquare, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

function ForgotPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10 backdrop-blur">
            <MessageSquare className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold">WhatsApp Platform</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Reset Your Password
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-md">
            Don't worry! Enter your email address and we'll send you instructions to reset your password.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <span className="text-lg">📧</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Check Your Email</h3>
                <p className="text-sm text-primary-foreground/80">
                  We'll send you a secure link to reset your password
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <span className="text-lg">🔒</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Process</h3>
                <p className="text-sm text-primary-foreground/80">
                  The reset link is valid for 1 hour only
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Quick & Easy</h3>
                <p className="text-sm text-primary-foreground/80">
                  Create a new password and regain access instantly
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-primary-foreground/70">
          © 2025 WhatsApp Platform. All rights reserved.
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-br from-background to-accent/20">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-none backdrop-blur">
              <CardHeader className="space-y-4 pb-8 pt-8">
                {/* Mobile Logo with Animation */}
                <div className="flex items-center justify-center lg:hidden mb-2">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground animate-in zoom-in-50 duration-500">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                </div>
                
                {/* Back Button */}
                <button
                  onClick={handleBackToLogin}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to login
                </button>
                
                {/* Title */}
                <CardTitle className="text-3xl font-bold text-center lg:text-left">
                  <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                    {emailSent ? 'Check your email' : 'Forgot password?'}
                  </span>
                </CardTitle>
                
                {/* Subtitle */}
                <CardDescription className="text-center lg:text-left text-base">
                  {emailSent ? (
                    "We've sent password reset instructions to your email address."
                  ) : (
                    "No worries! Enter your email and we'll send you reset instructions."
                  )}
                </CardDescription>
              </CardHeader>

              {!emailSent ? (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6 px-8">
                    {/* Error Message */}
                    {error && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold leading-none text-foreground">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="h-4 w-4" />}
                        required
                        className="h-12 text-base"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the email address associated with your account
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        'Send reset instructions'
                      )}
                    </Button>

                    {/* Back to Login Link */}
                    <div className="text-center pt-4">
                      <button
                        type="button"
                        onClick={handleBackToLogin}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Remember your password?{' '}
                        <span className="font-semibold text-primary hover:underline">
                          Back to login
                        </span>
                      </button>
                    </div>
                  </CardContent>
                </form>
              ) : (
                <CardContent className="space-y-6 px-8">
                  {/* Success Message */}
                  <div className="flex flex-col items-center text-center space-y-4 py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Email sent successfully!</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        We've sent password reset instructions to <strong>{email}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please check your inbox and follow the instructions to reset your password.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button 
                      onClick={handleBackToLogin}
                      className="w-full h-12 text-base font-semibold"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Button>
                    
                    <button
                      onClick={() => {
                        setEmailSent(false);
                        setEmail('');
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Didn't receive the email?{' '}
                      <span className="font-semibold text-primary hover:underline">
                        Resend
                      </span>
                    </button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Help Text - Bottom */}
        <div className="w-full">
          <p className="text-xs text-center text-muted-foreground px-4 py-4 leading-relaxed">
            Need help?{' '}
            <a href="mailto:support@example.com" className="underline hover:text-foreground font-medium transition-colors">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

