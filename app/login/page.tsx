// Created by Shibili Aman TK | GitHub: https://github.com/LordSA
'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, KeyRound, Mail, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const [passwordEmail, setPasswordEmail] = useState('');
  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: passwordEmail,
        password: password,
      });

      if (signInError) {
        setError(signInError.message || 'Invalid email or password credentials.');
        return;
      }

      if (data.session) {
        setSuccessMsg('Authentication successful! Redirecting to Dashboard...');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      }
    } catch {
      setError('An unexpected error occurred during password authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        setError(otpError.message || 'Failed to send OTP code. Ensure email is registered.');
        return;
      }

      setSuccessMsg(`A 6-digit verification code has been dispatched to ${email}.`);
      setStep('otp');
    } catch {
      setError('Failed to request verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpToken.trim(),
        type: 'email',
      });

      if (verifyError) {
        setError(verifyError.message || 'Invalid 6-digit code. Check code and try again.');
        return;
      }

      if (data.session) {
        setSuccessMsg('OTP verified! Accessing dashboard...');
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090d] flex items-center justify-center pt-28 md:pt-32 pb-12 px-4 relative text-[#f8fafc]">
      <div className="w-full max-w-md bg-[#0f121d] border-2 border-[#1e2436] shadow-[6px_6px_0px_0px_#161a29] rounded-xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <img src="/cev_logo.svg" alt="CEV EVENTS" className="h-10 w-auto object-contain" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">Manager Portal Login</h1>
          <p className="text-xs text-[#94a3b8]">
            Sign in with your password or 6-digit email OTP verification code.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#161a29] p-1 rounded-lg border border-[#1e2436]">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => { setAuthMode('password'); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${authMode === 'password'
              ? 'bg-[#6366f1] text-white shadow-sm font-bold'
              : 'text-[#94a3b8] hover:text-white'
              }`}
          >
            Password Auth
          </button>

          <button
            type="button"
            suppressHydrationWarning
            onClick={() => { setAuthMode('otp'); setError(''); setSuccessMsg(''); }}
            className={`py-2 text-xs font-semibold rounded-md transition-all ${authMode === 'otp'
              ? 'bg-[#6366f1] text-white shadow-sm font-bold'
              : 'text-[#94a3b8] hover:text-white'
              }`}
          >
            6-Digit Email OTP
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-200">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} suppressHydrationWarning className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    suppressHydrationWarning
                    value={passwordEmail}
                    onChange={(e) => setPasswordEmail(e.target.value)}
                    placeholder="manager@cev.ac.in"
                    required
                    className="w-full bg-[#161a29] text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                  Auth Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    suppressHydrationWarning
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#161a29] text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                suppressHydrationWarning
                disabled={loading}
                className="w-full brutalist-btn-primary py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        {authMode === 'otp' && (
          <>
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} suppressHydrationWarning className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                    Manager Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      suppressHydrationWarning
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="manager@cev.ac.in"
                      required
                      className="w-full bg-[#161a29] text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm border border-[#1e2436] focus:outline-none focus:border-[#6366f1]"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={loading}
                  className="w-full brutalist-btn-primary py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Sending Code...' : 'Send 6-Digit OTP Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} suppressHydrationWarning className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      suppressHydrationWarning
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      placeholder="123456"
                      required
                      maxLength={6}
                      className="w-full bg-[#161a29] text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2.5 text-sm border border-[#1e2436] focus:outline-none focus:border-[#6366f1] text-center font-mono text-xl tracking-[0.4em]"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  suppressHydrationWarning
                  disabled={loading || otpToken.length < 6}
                  className="w-full brutalist-btn-primary py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setStep('email')}
                  className="w-full py-1 text-xs text-[#94a3b8] hover:text-white transition-colors"
                >
                  Resend OTP or change email
                </button>
              </form>
            )}
          </>
        )}

        <div className="text-center pt-4 border-t border-[#1e2436]">
          <Link href="/" className="text-xs text-[#94a3b8] hover:text-white transition-colors">
            &larr; Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090d] flex items-center justify-center text-white text-sm">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
