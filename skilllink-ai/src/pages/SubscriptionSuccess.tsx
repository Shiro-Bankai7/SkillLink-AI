import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { checkRevenueCatEntitlement } from '../services/revenuecat';
import { CircularProgress, Typography, Box } from '@mui/material';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'verified' | 'error'>('loading');

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      const user = session.data.session?.user;
      if (!user) {
        setStatus('error');
        return;
      }

      const hasPremium = await checkRevenueCatEntitlement(user.id);
      if (hasPremium) {
        await supabase.from('profiles').update({ plan: 'pro' }).eq('id', user.id);
        setStatus('verified');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStatus('error');
      }
    })();
  }, []);

  return (
    <Box className="flex flex-col items-center justify-center h-screen text-center">
      {status === 'loading' && (
        <>
          <CircularProgress />
          <Typography variant="h6" mt={2}>Verifying subscription...</Typography>
        </>
      )}
      {status === 'verified' && (
        <Typography variant="h5" color="success.main">You're now Pro! Redirecting...</Typography>
      )}
      {status === 'error' && (
        <Typography variant="h5" color="error.main">Could not verify your subscription.</Typography>
      )}
    </Box>
  );
}
