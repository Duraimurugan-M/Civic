import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';

export default function Register() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', aadhaarNumber: '' });
  const [showPw, setShowPw] = useState(false);
  const { setUser }         = useAuthStore();
  const navigate            = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    },
    onError: e => toast.error(e.response?.data?.message || 'Registration failed'),
  });

  const update = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg,#0F172A 0%,#1E3A8A 50%,#0F172A 100%)' }}
    >
      {/* Back to landing page */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          ← Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)' }}
          >
            🏛️
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CivicConnect</h1>
          <p className="text-slate-400 text-sm mt-1">Smart Civic Issue Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-slate-400 text-sm mb-6">Join as a citizen to report civic issues</p>

          <form
            onSubmit={e => { e.preventDefault(); mutate(form); }}
            className="space-y-4"
          >
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                className="input"
                placeholder="Eg: John Doe"
                value={form.name}
                onChange={update('name')}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={update('email')}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-14"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={update('password')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Aadhaar */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Aadhaar Number *
              </label>
              <input
                type="text"
                className="input"
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                value={form.aadhaarNumber}
                onChange={update('aadhaarNumber')}
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Required for identity verification. Each Aadhaar can register only once.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {isPending ? <Spinner size="sm" /> : '🚀 Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}