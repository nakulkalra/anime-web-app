'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Lock, 
  User, 
  Chrome,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { FaDiscord,FaGoogle } from 'react-icons/fa';


interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  name: string;
  password: string;
}

const Login = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({ email: '', name: '', password: '' });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeTab === 'login') {
      const { name, value } = e.target;
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else if (activeTab === 'signup') {
      const { name, value } = e.target;
      setSignupData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message);
      } else {
        setSuccess('Login successful!');
        setError('');
        window.location.href = '/';
      }
    } catch (error) {
      setError('Login failed');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message);
      } else {
        setSuccess('Signup successful!');
        setError('');
      }
    } catch (error) {
      setError('Signup failed');
    }
  };

  const handleSocialLogin = (provider: 'google' | 'discord') => {
    window.location.href = `http://localhost:4000/auth/${provider}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md mx-4 bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-8">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
            className="space-y-8"
          >
            <TabsList className="grid grid-cols-2 w-full bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
              <TabsTrigger
                value="login"
                className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your credentials to access your account</p>
              </div>

              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaGoogle className="w-5 h-5" />
                  Continue with Google
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('discord')}
                  className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaDiscord className="w-5 h-5" />
                  Continue with Discord
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <p>{success}</p>
                  </div>
                )}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Sign up for a new account</p>
              </div>

              <div className="space-y-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('google')}
                  className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaGoogle className="w-5 h-5" />
                  Continue with Google
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleSocialLogin('discord')}
                  className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaDiscord className="w-5 h-5" />
                  Continue with Discord
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Name"
                    name="name"
                    value={signupData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-white dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <p>{success}</p>
                  </div>
                )}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;