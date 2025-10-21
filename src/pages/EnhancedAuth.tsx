import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Mail, Lock, User, Users, ArrowLeft, Sparkles, Heart, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { AnimatedInput } from '@/components/auth/AnimatedInput';
import { LoadingButton } from '@/components/auth/LoadingButton';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters long');
const nameSchema = z.string().min(1, 'This field is required').max(50, 'Name must be less than 50 characters');

const EnhancedAuth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'login';
  
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentEmail: ''
  });
  const [resetForm, setResetForm] = useState({ email: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [fieldFocused, setFieldFocused] = useState<Record<string, boolean>>({});
  
  const { user, signIn, signUp, signInWithGoogle, changePassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  // Email validation
  const loginEmailValidation = useEmailValidation(loginForm.email);
  const signupEmailValidation = useEmailValidation(signupForm.email);
  const resetEmailValidation = useEmailValidation(resetForm.email);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Detect password reset token from URL hash
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (type === 'recovery' && accessToken) {
      setActiveTab('change-password');
      toast({
        title: "Reset your password",
        description: "Enter your new password below.",
      });
    }
  }, []);

  // Real-time validation
  const validateField = (field: string, value: string, form: 'login' | 'signup' | 'reset' | 'change-password') => {
    let error = '';
    
    try {
      switch (field) {
        case 'email':
          emailSchema.parse(value);
          break;
        case 'password':
          passwordSchema.parse(value);
          break;
        case 'firstName':
        case 'lastName':
          nameSchema.parse(value);
          break;
        case 'confirmPassword':
          if (form === 'signup' && value !== signupForm.password) {
            error = 'Passwords do not match';
          } else if (form === 'change-password' && value !== changePasswordForm.newPassword) {
            error = 'Passwords do not match';
          }
          break;
      }
    } catch (e) {
      if (e instanceof z.ZodError) {
        error = e.issues[0].message;
      }
    }
    
    setErrors(prev => ({ ...prev, [`${form}-${field}`]: error }));
    setSuccessStates(prev => ({ ...prev, [`${form}-${field}`]: !error && value.length > 0 }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) return;
    
    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setIsLoading(false);
    
    if (!error) {
      // Success animation
      setSuccessStates(prev => ({ ...prev, 'login-submit': true }));
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName) return;
    
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered don't match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(
      signupForm.email,
      signupForm.password,
      signupForm.firstName,
      signupForm.lastName,
      signupForm.parentEmail || undefined
    );
    setIsLoading(false);
    
    if (!error) {
      setSuccessStates(prev => ({ ...prev, 'signup-submit': true }));
      setTimeout(() => {
        toast({
          title: "Welcome to Artechtist AI! 🎉",
          description: "Please check your email to verify your account.",
        });
      }, 1000);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetForm.email) return;
    
    setIsLoading(true);
    const { error } = await resetPassword(resetForm.email);
    setIsLoading(false);
    
    if (!error) {
      setSuccessStates(prev => ({ ...prev, 'reset-submit': true }));
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordForm.newPassword || !changePasswordForm.confirmPassword) return;
    
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "The passwords you entered don't match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await changePassword(changePasswordForm.newPassword);
    setIsLoading(false);
    
    if (!error) {
      setSuccessStates(prev => ({ ...prev, 'change-password-submit': true }));
      setChangePasswordForm({ newPassword: '', confirmPassword: '' });
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-red-950/20 flex items-center justify-center p-4 animate-fade-in">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-6xl animate-glow-pulse opacity-20">
          <Sparkles className="text-primary" />
        </div>
        <div className="absolute top-40 right-32 text-4xl animate-comic-float opacity-30">
          <Heart className="text-pink-400" />
        </div>
        <div className="absolute bottom-32 left-40 text-5xl animate-comic-pulse opacity-25">
          <Star className="text-yellow-400" />
        </div>
        <div className="absolute bottom-20 right-20 text-3xl animate-sparkle opacity-20">
          ✨
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-in-left">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Brain className="h-12 w-12 text-primary animate-glow-pulse" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
              Artechtist AI
            </h1>
          </div>
          
          <p className="text-muted-foreground">
            Join thousands of young African innovators building AI ✨
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Sign Up
            </TabsTrigger>
            <TabsTrigger value="reset" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Reset
            </TabsTrigger>
            <TabsTrigger value="change-password" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Change
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login" className="animate-fade-in">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Welcome back! 👋</CardTitle>
                <CardDescription>
                  Ready to continue your AI adventure?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <AnimatedInput
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={loginForm.email}
                    onChange={(e) => {
                      setLoginForm(prev => ({ ...prev, email: e.target.value }));
                      validateField('email', e.target.value, 'login');
                    }}
                    error={errors['login-email']}
                    success={successStates['login-email']}
                    isLoading={loginEmailValidation.isChecking}
                    required
                  />
                  
                  <AnimatedInput
                    label="Password"
                    type="password"
                    icon={<Lock className="h-4 w-4" />}
                    value={loginForm.password}
                    onChange={(e) => {
                      setLoginForm(prev => ({ ...prev, password: e.target.value }));
                      validateField('password', e.target.value, 'login');
                    }}
                    error={errors['login-password']}
                    success={successStates['login-password']}
                    showPasswordToggle
                    required
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-primary hover:underline transition-colors duration-200"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <LoadingButton
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    success={successStates['login-submit']}
                    disabled={!loginForm.email || !loginForm.password}
                  >
                    {successStates['login-submit'] ? '🎉 Welcome back!' : 'Sign In'}
                  </LoadingButton>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-border hover:bg-accent transition-all duration-200 hover:scale-105"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup" className="animate-fade-in">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Join the Adventure! 🚀</CardTitle>
                <CardDescription>
                  Start building amazing AI projects today - it's free!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatedInput
                      label="First Name"
                      type="text"
                      icon={<User className="h-4 w-4" />}
                      value={signupForm.firstName}
                      onChange={(e) => {
                        setSignupForm(prev => ({ ...prev, firstName: e.target.value }));
                        validateField('firstName', e.target.value, 'signup');
                      }}
                      error={errors['signup-firstName']}
                      success={successStates['signup-firstName']}
                      required
                    />
                    
                    <AnimatedInput
                      label="Last Name"
                      type="text"
                      icon={<User className="h-4 w-4" />}
                      value={signupForm.lastName}
                      onChange={(e) => {
                        setSignupForm(prev => ({ ...prev, lastName: e.target.value }));
                        validateField('lastName', e.target.value, 'signup');
                      }}
                      error={errors['signup-lastName']}
                      success={successStates['signup-lastName']}
                      required
                    />
                  </div>

                  <AnimatedInput
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={signupForm.email}
                    onChange={(e) => {
                      setSignupForm(prev => ({ ...prev, email: e.target.value }));
                      validateField('email', e.target.value, 'signup');
                    }}
                    error={errors['signup-email'] || (signupEmailValidation.error && signupForm.email ? signupEmailValidation.error : undefined)}
                    success={successStates['signup-email'] && signupEmailValidation.isValid}
                    isLoading={signupEmailValidation.isChecking}
                    required
                  />
                  
                  <AnimatedInput
                    label="Password"
                    type="password"
                    icon={<Lock className="h-4 w-4" />}
                    value={signupForm.password}
                    onChange={(e) => {
                      setSignupForm(prev => ({ ...prev, password: e.target.value }));
                      validateField('password', e.target.value, 'signup');
                    }}
                    error={errors['signup-password']}
                    success={successStates['signup-password']}
                    showPasswordToggle
                    required
                  />

                  <PasswordStrengthMeter password={signupForm.password} />
                  
                  <AnimatedInput
                    label="Confirm Password"
                    type="password"
                    icon={<Lock className="h-4 w-4" />}
                    value={signupForm.confirmPassword}
                    onChange={(e) => {
                      setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                      validateField('confirmPassword', e.target.value, 'signup');
                    }}
                    error={errors['signup-confirmPassword']}
                    success={successStates['signup-confirmPassword']}
                    showPasswordToggle
                    required
                  />

                  <AnimatedInput
                    label="Parent/Guardian Email (Optional)"
                    type="email"
                    icon={<Users className="h-4 w-4" />}
                    value={signupForm.parentEmail}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground -mt-2">
                    Recommended for learners under 16 years old 👨‍👩‍👧‍👦
                  </p>

                  <LoadingButton
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    success={successStates['signup-submit']}
                    disabled={!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password || !signupForm.confirmPassword}
                  >
                    {successStates['signup-submit'] ? '🎉 Account Created!' : 'Create Account'}
                  </LoadingButton>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-border hover:bg-accent transition-all duration-200 hover:scale-105"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <p className="mt-6 text-xs text-center text-muted-foreground">
                  By signing up, you agree to our Terms of Service and Privacy Policy 📋
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reset Password Form */}
          <TabsContent value="reset" className="animate-fade-in">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Reset Password 🔐</CardTitle>
                <CardDescription>
                  No worries! We'll send you reset instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <AnimatedInput
                    label="Email Address"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    value={resetForm.email}
                    onChange={(e) => {
                      setResetForm({ email: e.target.value });
                      validateField('email', e.target.value, 'reset');
                    }}
                    error={errors['reset-email']}
                    success={successStates['reset-email']}
                    isLoading={resetEmailValidation.isChecking}
                    required
                  />

                  <LoadingButton
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    success={successStates['reset-submit']}
                    disabled={!resetForm.email}
                  >
                    {successStates['reset-submit'] ? '📧 Email Sent!' : 'Send Reset Link'}
                  </LoadingButton>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-sm text-primary hover:underline transition-colors duration-200"
                  >
                    Remember your password? Sign in
                  </button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password Form */}
          <TabsContent value="change-password" className="animate-fade-in">
            <Card className="border-border/50 shadow-elegant backdrop-blur-sm bg-card/95">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Change Password 🔑</CardTitle>
                <CardDescription>
                  {user ? "Create a new secure password" : "You must be signed in to change your password"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <AnimatedInput
                      label="New Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      value={changePasswordForm.newPassword}
                      onChange={(e) => {
                        setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }));
                        validateField('password', e.target.value, 'change-password');
                      }}
                      error={errors['change-password-password']}
                      success={successStates['change-password-password']}
                      showPasswordToggle
                      required
                    />

                    <PasswordStrengthMeter password={changePasswordForm.newPassword} />
                    
                    <AnimatedInput
                      label="Confirm New Password"
                      type="password"
                      icon={<Lock className="h-4 w-4" />}
                      value={changePasswordForm.confirmPassword}
                      onChange={(e) => {
                        setChangePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                        validateField('confirmPassword', e.target.value, 'change-password');
                      }}
                      error={errors['change-password-confirmPassword']}
                      success={successStates['change-password-confirmPassword']}
                      showPasswordToggle
                      required
                    />

                    <LoadingButton
                      type="submit"
                      className="w-full"
                      isLoading={isLoading}
                      success={successStates['change-password-submit']}
                      disabled={!changePasswordForm.newPassword || !changePasswordForm.confirmPassword || 
                                changePasswordForm.newPassword !== changePasswordForm.confirmPassword}
                    >
                      {successStates['change-password-submit'] ? '✅ Password Updated!' : 'Update Password'}
                    </LoadingButton>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Please sign in to change your password</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('login')}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      Go to Sign In
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAuth;