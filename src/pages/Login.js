import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import { MessageSquare, Mail, Lock, Shield, FileText, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';

function Login() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login with Supabase
        await signIn(formData.email, formData.password);
        navigate('/');
      } else {
        // Sign up with Supabase
        await signUp(formData.email, formData.password, formData.name);
        // Show success message
        alert('Account created! Please check your email to verify your account.');
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 p-12 flex-col justify-between">
        <div className="flex items-center">
          <Logo size="large" showText={true} variant="default" />
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            Welcome to WhatsApp Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-md">
            Manage multiple WhatsApp sessions, automate messaging, and connect with your customers efficiently.
          </p>
          
          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Multi-Session Support</h3>
                <p className="text-sm text-gray-600">
                  Manage multiple WhatsApp accounts simultaneously
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                🤖
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Automated Messaging</h3>
                <p className="text-sm text-gray-600">
                  Create bots and schedule messages automatically
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                👥
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900">Contact Management</h3>
                <p className="text-sm text-gray-600">
                  Organize contacts into groups for easy targeting
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          © 2025 WhatsApp Platform. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 bg-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Card className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="space-y-4 pb-8 pt-8">
              {/* Mobile Logo with Animation */}
              <div className="flex items-center justify-center lg:hidden mb-2">
                <Logo size="large" showText={false} variant="icon-only" />
              </div>
              
              {/* Title */}
              <CardTitle className="text-3xl font-bold text-center lg:text-left text-gray-900">
                {isLogin ? 'Welcome back' : 'Create account'}
              </CardTitle>
              
              {/* Subtitle with Animation */}
              <CardDescription className="text-center lg:text-left text-base text-gray-600">
                {isLogin ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="font-semibold text-primary hover:underline transition-all inline-flex items-center gap-1 hover:gap-2"
                    >
                      Sign up
                      <span className="transition-transform">→</span>
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="font-semibold text-primary hover:underline transition-all inline-flex items-center gap-1 hover:gap-2"
                    >
                      Login
                      <span className="transition-transform">→</span>
                    </button>
                  </>
                )}
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 px-8">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Name Field - Signup only with animation */}
                {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-semibold leading-none text-foreground">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required={!isLogin}
                    className="h-12 text-base"
                  />
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  icon={<Mail className="h-4 w-4" />}
                  required
                  className="h-12 text-base"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold leading-none text-foreground">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-primary hover:underline transition-all font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  icon={<Lock className="h-4 w-4" />}
                  required
                  className="h-12 text-base"
                />
                {!isLogin && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground"></span>
                    Must be at least 8 characters
                  </p>
                )}
              </div>

              {/* Submit Button with Enhanced Styling */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 border-3 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign in to your account' : 'Create your account'
                )}
              </Button>

              </CardContent>
            </form>
          </Card>
          </div>
        </div>

        {/* Terms Notice - Bottom of Page */}
        <div className="w-full">
          <p className="text-xs text-center text-gray-500 px-4 py-4 leading-relaxed">
            By clicking continue, you agree to our{' '}
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="underline hover:text-foreground cursor-pointer font-medium transition-colors"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={() => setShowPrivacy(true)}
              className="underline hover:text-foreground cursor-pointer font-medium transition-colors"
            >
              Privacy Policy
            </button>
            .
          </p>
        </div>

        {/* Terms of Service Dialog */}
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent onClose={() => setShowTerms(false)} className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Terms of Service
              </DialogTitle>
              <DialogDescription>
                Last updated: October 19, 2025
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using WhatsApp Platform ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. Use License</h3>
                <p className="text-muted-foreground mb-2">
                  Permission is granted to temporarily use the Service for personal or commercial use. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose without authorization</li>
                  <li>Attempt to decompile or reverse engineer any software</li>
                  <li>Remove any copyright or proprietary notations</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. WhatsApp Usage Policy</h3>
                <p className="text-muted-foreground mb-2">
                  You agree to use this platform in compliance with WhatsApp's Terms of Service and Business Policy:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Do not send spam or unsolicited messages</li>
                  <li>Respect WhatsApp's rate limits and policies</li>
                  <li>Obtain consent from recipients before messaging</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. Account Responsibilities</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. Disclaimer</h3>
                <p className="text-muted-foreground">
                  The Service is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted or error-free.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  In no event shall WhatsApp Platform be liable for any damages arising out of the use or inability to use the Service.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Contact Information</h3>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at support@example.com
                </p>
              </section>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowTerms(false)}>
                I Understand
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Policy Dialog */}
        <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
          <DialogContent onClose={() => setShowPrivacy(false)} className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy Policy
              </DialogTitle>
              <DialogDescription>
                Last updated: October 19, 2025
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Information We Collect</h3>
                <p className="text-muted-foreground mb-2">
                  We collect information you provide directly to us:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Account information (name, email, password)</li>
                  <li>WhatsApp session data</li>
                  <li>Messages and contacts you manage</li>
                  <li>Usage data and analytics</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">2. How We Use Your Information</h3>
                <p className="text-muted-foreground mb-2">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Provide, maintain, and improve our Service</li>
                  <li>Process your WhatsApp messaging operations</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">3. Data Storage and Security</h3>
                <p className="text-muted-foreground">
                  We use Supabase for secure data storage with industry-standard encryption. Your WhatsApp session data is stored locally and encrypted. We implement appropriate technical and organizational measures to protect your data.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">4. Data Sharing</h3>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share your information only:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">5. Your Rights</h3>
                <p className="text-muted-foreground mb-2">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">6. Cookies and Tracking</h3>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">7. Data Retention</h3>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">8. Children's Privacy</h3>
                <p className="text-muted-foreground">
                  Our Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">9. Changes to Privacy Policy</h3>
                <p className="text-muted-foreground">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-base mb-2">10. Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at privacy@example.com
                </p>
              </section>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowPrivacy(false)}>
                I Understand
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Login;

