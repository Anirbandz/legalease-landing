'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function Auth({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    if (!username || username.length > 6) {
      setError('Username required (max 6 characters)');
      setLoading(false);
      return;
    }
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username, display_name: username },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        console.error('Sign up error:', signUpError.message);
      } else {
        alert('Check your email for a confirmation link!');
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError('Unexpected error during sign up');
      console.error('Unexpected sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    console.log('Attempting sign in:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        console.error('Sign in error:', error.message);
      } else {
        if (onAuthSuccess) onAuthSuccess();
      }
    } catch (err) {
      setError('Unexpected error during sign in');
      console.error('Unexpected sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: 8, fontSize: 16 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 8, fontSize: 16 }}
      />
      {isSignUp && (
        <input
          type="text"
          placeholder="Username (max 7 chars)"
          value={username}
          maxLength={7}
          onChange={e => setUsername(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
      )}
      {isSignUp ? (
        <>
          <Button onClick={handleSignUp} disabled={loading} style={{ padding: 8, fontSize: 16 }}>
            Sign Up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSignUp(false)}
            style={{ opacity: 0.6, marginTop: 4 }}
            disabled={loading}
          >
            Already have an account? Sign In
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleSignIn} disabled={loading} style={{ padding: 8, fontSize: 16 }}>
            Sign In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSignUp(true)}
            style={{ opacity: 0.6, marginTop: 4 }}
            disabled={loading}
          >
            New here? Sign Up
          </Button>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
} 