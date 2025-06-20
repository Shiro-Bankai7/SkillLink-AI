import { useForm } from 'react-hook-form';
import { Button, TextField, Divider } from '@mui/material';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import GoogleIcon from '@mui/icons-material/Google';
import { motion } from 'framer-motion';

type AuthFormData = {
  email: string;
  password: string;
};

export default function AuthForm({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const { register, handleSubmit } = useForm<AuthFormData>();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: AuthFormData) => {
    setError('');
    const { email, password } = data;
    let res;

    if (mode === 'signup') {
      res = await supabase.auth.signUp({ email, password });
    } else {
      res = await supabase.auth.signInWithPassword({ email, password });
    }

    if (res.error) {
      setError(res.error.message);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-indigo-50 to-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="backdrop-blur-sm bg-white/70 border border-gray-200 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-1">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-600 mb-6">
          {mode === 'signup'
            ? 'Join SkillLink AI and grow your skillset!'
            : 'Login to continue your growth journey'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            {...register('password')}
          />
          {error && (
            <motion.p
              className="text-red-500 text-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            size="large"
          >
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </Button>

          <Divider className="!my-4 text-gray-400">or</Divider>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<GoogleIcon />}
            className="border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Log in
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{' '}
              <span
                onClick={() => navigate('/signup')}
                className="text-indigo-600 font-medium cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
