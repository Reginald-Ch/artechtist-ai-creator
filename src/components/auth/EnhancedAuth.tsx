import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Mail, Lock, User, Users, ArrowLeft, Eye, EyeOff, CheckCircle, X, AlertCircle, ShieldCheck, RefreshCw, Gem } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";

const EnhancedAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authErrors, setAuthErrors] = useState<string[]>([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    parentEmail: ''
  });
  const [treasureCode, setTreasureCode] = useState('');
  
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (password.length >= 16) strength += 10;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Bonus for variety
    const uniqueChars = new Set(password.toLowerCase()).size;
    if (uniqueChars >= 8) strength += 10;
    
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'text-red-500';
    if (passwordStrength < 60) return 'text-yellow-500';
    if (passwordStrength < 80) return 'text-orange-500';
    return 'text-green-500';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrors([]);
    
    if (!loginForm.email || !loginForm.password) {
      setAuthErrors(['Please fill in all required fields']);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      setAuthErrors(['Please enter a valid email address']);
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    setIsLoading(false);
    
    if (error) {
      console.error('Login error:', error);
      const errorMessage = error.message.toLowerCase();
      
      let userFriendlyMessage = 'Login failed. Please try again.';
      if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
        userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('email not confirmed')) {
        userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
        setEmailConfirmationSent(true);
        setCanResendEmail(true);
      } else if (errorMessage.includes('too many requests')) {
        userFriendlyMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (errorMessage.includes('user not found')) {
        userFriendlyMessage = 'No account found with this email address. Please sign up first.';
      }
      
      setAuthErrors([userFriendlyMessage]);
      toast({
        title: "Login Failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrors([]);
    
    // Validation
    if (!signupForm.email || !signupForm.password || !signupForm.firstName || !signupForm.lastName) {
      setAuthErrors(['Please fill in all required fields']);
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupForm.email)) {
      setAuthErrors(['Please enter a valid email address']);
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthErrors(['Passwords do not match']);
      return;
    }
    
    if (passwordStrength < 60) {
      setAuthErrors(['Please create a stronger password (at least 60% strength)']);
      return;
    }
    
    // Name validation
    if (signupForm.firstName.length < 2 || signupForm.lastName.length < 2) {
      setAuthErrors(['First and last names must be at least 2 characters long']);
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
    
    if (error) {
      console.error('Signup error:', error);
      const errorMessage = error.message.toLowerCase();
      
      let userFriendlyMessage = 'Signup failed. Please try again.';
      if (errorMessage.includes('email already registered') || errorMessage.includes('user already registered')) {
        userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
        userFriendlyMessage = 'Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.';
      } else if (errorMessage.includes('invalid email')) {
        userFriendlyMessage = 'Please enter a valid email address.';
      }
      
      setAuthErrors([userFriendlyMessage]);
      toast({
        title: "Signup Failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    } else {
      setEmailConfirmationSent(true);
      setCanResendEmail(false);
      setResendCooldown(60); // 60 second cooldown
      
      toast({
        title: "Account Created!",
        description: "Please check your email to confirm your account before signing in.",
      });
    }
  };

  const handleGoogleAuth = async () => {
    setAuthErrors([]);
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);
    
    if (error) {
      console.error('Google auth error:', error);
      const errorMessage = error.message.toLowerCase();
      
      let userFriendlyMessage = 'Google sign-in failed. Please try again.';
      if (errorMessage.includes('popup') && errorMessage.includes('closed')) {
        userFriendlyMessage = 'Sign-in was cancelled. Please try again and complete the Google authentication.';
      } else if (errorMessage.includes('network')) {
        userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
      } else if (errorMessage.includes('configuration')) {
        userFriendlyMessage = 'Google sign-in is not properly configured. Please contact support.';
      }
      
      setAuthErrors([userFriendlyMessage]);
      toast({
        title: "Google Sign-In Failed",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }
  };

  const handleTreasureCode = async () => {
    if (!treasureCode || treasureCode.length !== 5 || !/^\d{5}$/.test(treasureCode)) {
      toast({
        title: "Invalid treasure code",
        description: "Please enter a 5-digit treasure code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-treasure-code', {
        body: { code: treasureCode }
      });

      if (error) {
        throw error;
      }

      if (data.success && data.session) {
        // Set the session manually
        await supabase.auth.setSession(data.session);
        
        toast({
          title: "Welcome, Treasure Hunter! 🏴‍☠️",
          description: `${data.message} Your access expires on ${new Date(data.expires_at).toLocaleDateString()}`,
        });
        
        navigate('/dashboard');
      } else {
        throw new Error(data.error || 'Invalid treasure code');
      }
    } catch (error: any) {
      toast({
        title: "Treasure hunt failed",
        description: error.message || "Invalid or expired treasure code. Check your code and try again!",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!canResendEmail || resendCooldown > 0) return;
    
    setIsLoading(true);
    // This would typically call a resend confirmation email function
    // For now, we'll simulate it
    setTimeout(() => {
      setIsLoading(false);
      setCanResendEmail(false);
      setResendCooldown(60);
      toast({
        title: "Confirmation Email Sent",
        description: "Please check your email inbox and spam folder.",
      });
    }, 1000);
  };

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => {
          const newValue = prev - 1;
          if (newValue === 0) {
            setCanResendEmail(true);
          }
          return newValue;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(signupForm.password));
  }, [signupForm.password]);

  // Email confirmation message
  if (emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-red-950/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glassmorphism shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Check Your Email!</CardTitle>
              <CardDescription className="text-base">
                We've sent a confirmation link to your email address. Please click the link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Don't forget to check your spam folder if you don't see the email in your inbox.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleResendConfirmation}
                  disabled={!canResendEmail || resendCooldown > 0 || isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Confirmation Email
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => setEmailConfirmationSent(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-red-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-12 w-12 text-primary animate-glow-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
              Artechtist AI
            </h1>
          </div>
          
          <p className="text-muted-foreground">
            Join thousands of young African innovators building AI
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="treasure">Treasure Hunt</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <Card className="border-border/50 shadow-lg glassmorphism">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
                <CardDescription>
                  Sign in to continue building amazing AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {authErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {authErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">Your data is protected with bank-level security</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
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
                    className="w-full mt-4 border-border hover:bg-accent transition-all duration-300"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup">
            <Card className="border-border/50 shadow-lg glassmorphism">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>
                  Start your AI journey today - it's free!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {authErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        {authErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-firstname"
                          type="text"
                          placeholder="First name"
                          className="pl-10"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Last name"
                          className="pl-10"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-10"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Enhanced Password Strength Indicator */}
                    {signupForm.password && (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Password Strength</span>
                          <Badge 
                            variant={passwordStrength >= 80 ? "default" : passwordStrength >= 60 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {passwordStrength >= 80 ? 'Strong' : passwordStrength >= 60 ? 'Good' : passwordStrength >= 40 ? 'Fair' : 'Weak'}
                          </Badge>
                        </div>
                        <Progress value={passwordStrength} className="h-2" />
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            {signupForm.password.length >= 8 ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                            <span>At least 8 characters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/[A-Z]/.test(signupForm.password) && /[a-z]/.test(signupForm.password) ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                            <span>Upper & lowercase letters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/[0-9]/.test(signupForm.password) ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                            <span>At least one number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/[^A-Za-z0-9]/.test(signupForm.password) ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <X className="h-3 w-3 text-red-500" />
                            )}
                            <span>Special character (!@#$%^&*)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {signupForm.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm animate-fade-in">
                        {signupForm.password === signupForm.confirmPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-red-500">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Parent/Guardian Email</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parent-email"
                        type="email"
                        placeholder="parent@example.com (optional)"
                        className="pl-10"
                        value={signupForm.parentEmail}
                        onChange={(e) => setSignupForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended for learners under 16 years old
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg transition-all duration-300"
                    disabled={isLoading || passwordStrength < 60}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
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
                    className="w-full mt-4 border-border hover:bg-accent transition-all duration-300"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>

                <p className="mt-6 text-xs text-center text-muted-foreground">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="treasure">
            <Card className="border-2 border-gradient-to-r from-amber-500/50 to-orange-500/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Gem className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Treasure Hunt Access
                </CardTitle>
                <CardDescription className="text-base">
                  Enter your 5-digit treasure code to unlock your adventure! 🏴‍☠️
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="treasureCode" className="text-base font-medium">
                    Treasure Code
                  </Label>
                  <Input
                    id="treasureCode"
                    type="text"
                    placeholder="Enter 5-digit code (e.g., 12345)"
                    value={treasureCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                      setTreasureCode(value);
                    }}
                    className="text-center text-2xl font-mono tracking-widest border-2 border-amber-300 focus:border-amber-500 dark:border-amber-700 dark:focus:border-amber-500"
                    maxLength={5}
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    This code gives you free access to the app for a limited time
                  </p>
                </div>

                <Button 
                  onClick={handleTreasureCode} 
                  disabled={isLoading || treasureCode.length !== 5}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 text-lg shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Unlocking treasure...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gem className="h-5 w-5" />
                      Start Adventure
                    </div>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have a treasure code? Contact your teacher or program coordinator
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedAuth;