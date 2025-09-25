import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Mail, Lock, User, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle, Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
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
  
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrors([]);
    
    // Client-side validation
    const errors: string[] = [];
    if (!loginForm.email) errors.push('Email is required');
    if (!loginForm.password) errors.push('Password is required');
    if (loginForm.email && !validateEmail(loginForm.email)) errors.push('Please enter a valid email address');
    if (loginForm.password && !validatePassword(loginForm.password)) errors.push('Password must be at least 6 characters long');
    
    if (errors.length > 0) {
      setAuthErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await signIn(loginForm.email, loginForm.password);
      
      if (error) {
        let userFriendlyMessage = 'Login failed. Please try again.';
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
          userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (errorMessage.includes('email not confirmed')) {
          userFriendlyMessage = 'Please check your email and click the confirmation link before signing in.';
          setEmailConfirmationSent(true);
        } else if (errorMessage.includes('too many requests')) {
          userFriendlyMessage = 'Too many login attempts. Please wait a few minutes and try again.';
        } else if (errorMessage.includes('user not found')) {
          userFriendlyMessage = 'No account found with this email address. Please sign up first.';
        }
        
        setAuthErrors([userFriendlyMessage]);
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error: any) {
      setAuthErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrors([]);
    
    // Client-side validation
    const errors: string[] = [];
    if (!signupForm.firstName) errors.push('First name is required');
    if (!signupForm.lastName) errors.push('Last name is required');
    if (!signupForm.email) errors.push('Email is required');
    if (!signupForm.password) errors.push('Password is required');
    if (!signupForm.confirmPassword) errors.push('Please confirm your password');
    
    if (signupForm.firstName && signupForm.firstName.length < 2) errors.push('First name must be at least 2 characters long');
    if (signupForm.lastName && signupForm.lastName.length < 2) errors.push('Last name must be at least 2 characters long');
    if (signupForm.email && !validateEmail(signupForm.email)) errors.push('Please enter a valid email address');
    if (signupForm.password && signupForm.password.length < 8) errors.push('Password must be at least 8 characters long');
    if (signupForm.password && signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    if (errors.length > 0) {
      setAuthErrors(errors);
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await signUp(
        signupForm.email,
        signupForm.password,
        signupForm.firstName,
        signupForm.lastName,
        signupForm.parentEmail || undefined
      );
      
      if (error) {
        let userFriendlyMessage = 'Signup failed. Please try again.';
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('email already registered') || errorMessage.includes('user already registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (errorMessage.includes('password') && errorMessage.includes('weak')) {
          userFriendlyMessage = 'Password is too weak. Please use a stronger password.';
        } else if (errorMessage.includes('invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        }
        
        setAuthErrors([userFriendlyMessage]);
      } else {
        setEmailConfirmationSent(true);
        toast({
          title: "Account Created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      setAuthErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthErrors([]);
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        let userFriendlyMessage = 'Google sign-in failed. Please try again.';
        const errorMessage = error.message?.toLowerCase() || '';
        
        if (errorMessage.includes('popup') && errorMessage.includes('closed')) {
          userFriendlyMessage = 'Sign-in was cancelled. Please try again and complete the Google authentication.';
        } else if (errorMessage.includes('network')) {
          userFriendlyMessage = 'Network error. Please check your internet connection and try again.';
        }
        
        setAuthErrors([userFriendlyMessage]);
      }
    } catch (error: any) {
      setAuthErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  // Email confirmation message
  if (emailConfirmationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-border/50">
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
              
              <Button
                onClick={() => setEmailConfirmationSent(false)}
                variant="outline"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-primary/10 to-secondary/10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="h-12 w-12 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Artechtist AI
            </h1>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: 1 
              }}
            >
              <Sparkles className="h-6 w-6 text-accent" />
            </motion.div>
          </motion.div>
          
          <p className="text-muted-foreground">
            Join thousands of young African innovators building AI
          </p>
        </motion.div>

        {/* Auth Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
                <CardDescription>
                  Sign in to continue building amazing AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {authErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                  <Button
                    type="submit"
                    className="w-full relative overflow-hidden"
                    disabled={isLoading}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Star className="h-4 w-4" />
                          </motion.div>
                          Signing in...
                        </motion.div>
                      ) : (
                        <motion.span
                          key="text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Sign In
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                  </motion.div>
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
                    className="w-full mt-4"
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
            </motion.div>
          </TabsContent>

          {/* Signup Form */}
          <TabsContent value="signup">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription>
                  Start your AI journey today - it's free!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Error Display */}
                {authErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
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
                    {signupForm.password && signupForm.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm">
                        {signupForm.password === signupForm.confirmPassword ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent-email">Parent/Guardian Email (Optional)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="parent-email"
                        type="email"
                        placeholder="parent@example.com"
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
                    className="w-full"
                    disabled={isLoading}
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
                    className="w-full mt-4"
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
            </motion.div>
          </TabsContent>
        </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;