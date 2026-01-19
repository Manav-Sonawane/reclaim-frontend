'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleSignupData, setGoogleSignupData] = useState<{token: string, profile: any} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (googleSignupData) {
        // Complete Google Signup
        const { data } = await api.post('/auth/google', { 
            token: googleSignupData.token,
            name: name // Send custom name
        });
        login(data.token, data.user);
        toast.success('account created successfully!');
      } else {
        // Standard Signup
        const { data } = await api.post('/auth/register', { name, email, password });
        login(data.token, data.user);
        toast.success('Account created successfully!');
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credentialResponse: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { 
        token: credentialResponse.credential 
      });

      if (data.requiresSignup) {
        // New user - prompt for name
        setGoogleSignupData({ 
            token: credentialResponse.credential, 
            profile: data.googleProfile 
        });
        setName(data.googleProfile.name);
        setEmail(data.googleProfile.email);
        toast.success("Please confirm your details to finish");
      } else {
        // Existing user - login
        login(data.token, data.user);
        toast.success('Signed in with Google successfully!');
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {googleSignupData ? 'Complete Profile' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!googleSignupData}
              className={googleSignupData ? 'bg-gray-100 text-gray-500' : ''}
            />
            {!googleSignupData && (
                <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                />
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : (googleSignupData ? 'Finish Sign Up' : 'Sign Up')}
            </Button>
          </form>
          
          {!googleSignupData && (
              <>
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                    onSuccess={handleGoogleSignup}
                    onError={() => {
                        toast.error('Google signup failed');
                    }}
                    />
                </div>
              </>
          )}   
        </CardContent>
        {!googleSignupData && (
            <CardFooter className="justify-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="ml-1 text-blue-600 hover:underline">
                Login
            </Link>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
