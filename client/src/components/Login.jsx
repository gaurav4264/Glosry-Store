import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const EyeIcon = ({ open }) => open ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const Login = () => {
    const { setShowUserLogin, setUser, axios, navigate } = useAppContext();

    const [state, setState] = useState('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (state === 'register' && !name.trim()) e.name = 'Name is required';
        if (!email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
        if (!password) e.password = 'Password is required';
        else if (password.length < 6) e.password = 'Minimum 6 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const { data } = await axios.post(`/api/user/${state}`, { name, email, password });
            if (data.success) {
                setUser(data.user);
                setShowUserLogin(false);
                navigate('/');
                toast.success(state === 'register' ? `Welcome, ${data.user.name}! 🎉` : `Welcome back, ${data.user.name}!`);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const switchState = (newState) => {
        setState(newState);
        setErrors({});
        setName('');
        setEmail('');
        setPassword('');
    };

    const inp = (hasErr) =>
        `w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder-gray-300 ${hasErr
            ? 'border-red-400 bg-red-50 focus:border-red-500'
            : 'border-gray-200 focus:border-green-500 bg-gray-50 focus:bg-white'}`;

    return (
        <div
            onClick={() => setShowUserLogin(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <div
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-[820px] rounded-3xl overflow-hidden shadow-2xl flex"
                style={{ minHeight: '500px' }}
            >
                {/* ── Left Brand Panel ── */}
                <div className="hidden md:flex flex-col justify-between w-[42%] bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-10 text-white relative overflow-hidden">
                    <div className="absolute -top-14 -left-14 w-44 h-44 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-10 right-0 w-36 h-36 bg-white/10 rounded-full" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-xl">🛒</span>
                            </div>
                            <span className="text-xl font-black tracking-tight">GloseryShop</span>
                        </div>
                        <h2 className="text-3xl font-extrabold leading-snug mb-3 whitespace-pre-line">
                            {state === 'login' ? 'Welcome\nback! 👋' : 'Join us\ntoday! 🎉'}
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            {state === 'login'
                                ? 'Sign in to access your account and enjoy fresh groceries.'
                                : 'Create your account and start enjoying fresh deliveries.'}
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        {['Fresh groceries delivered daily', 'Track your orders live', 'Exclusive member deals & offers'].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">✓</div>
                                <p className="text-sm text-white/90">{f}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right Form Panel ── */}
                <div className="flex-1 bg-white p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
                    {/* Close */}
                    <button
                        onClick={() => setShowUserLogin(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all z-10"
                    >✕</button>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {state === 'login' ? 'Sign in to your account' : 'Create your account'}
                        </h1>
                        <p className="text-gray-400 text-sm mt-1.5">
                            {state === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button
                                onClick={() => switchState(state === 'login' ? 'register' : 'login')}
                                className="text-green-600 font-bold hover:text-green-700 transition-colors"
                            >
                                {state === 'login' ? 'Create one' : 'Sign in'}
                            </button>
                        </p>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={onSubmitHandler} noValidate className="space-y-4">
                        {state === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    autoComplete="name"
                                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                                    className={inp(errors.name)}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                autoComplete="email"
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                                className={inp(errors.email)}
                            />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1.5">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={state === 'register' ? 'Minimum 6 characters' : 'Enter your password'}
                                    value={password}
                                    autoComplete={state === 'register' ? 'new-password' : 'current-password'}
                                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                                    className={inp(errors.password) + ' pr-12'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-green-100 hover:shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>{state === 'register' ? 'Creating account...' : 'Signing in...'}</span>
                                </>
                            ) : (
                                <span>{state === 'register' ? '🎉 Create Account' : '🚀 Sign In'}</span>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-300 mt-5">
                        By continuing, you agree to our{' '}
                        <span className="text-green-500 cursor-pointer hover:underline">Terms</span>{' '}&{' '}
                        <span className="text-green-500 cursor-pointer hover:underline">Privacy Policy</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
