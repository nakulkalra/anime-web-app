'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Lock, User } from 'lucide-react';

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
        window.location.href = `/`;
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <Card className="w-full max-w-md mx-4 bg-zinc-900 border-zinc-800">
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-2 w-full bg-zinc-800">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-zinc-700"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-zinc-700"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
                <p className="text-zinc-400">Enter your credentials to access your account</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Login
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white mb-2">Create Account</h2>
                <p className="text-zinc-400">Sign up for a new account</p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Email"
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="name"
                    name="name"
                    value={signupData.name}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                  <Input
                    placeholder="Password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={handleInputChange}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                </div>
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
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
