import {
  Container, Typography, Grid, Card, CardContent,
  CardActions, Button, Divider, Chip, Box, CircularProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const plans = [
  {
    id: 'pro_monthly',
    title: 'Pro Monthly',
    price: '$9.64/mo',
    stripePriceId: 'prod_SWDbLUxbZNEl9P', // 💥 Replace with your real Stripe Price ID
    features: ['Unlimited barter', '3 AI tutors', 'Analytics'],
  },
  {
    id: 'pro_yearly',
    title: 'Pro Yearly',
    price: '$99/year',
    stripePriceId: 'prod_SWDc4MtbyJDtL9',
    features: ['Everything in Pro', 'Bonus XP', 'Annual savings'],
  },
];

export default function PricingPage() {
 const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await supabase.auth.getSession();
      const uid = session.data.session?.user?.id;
      if (uid) setUserId(uid);
      setLoading(false);
    })();
  }, []);

  const handleSubscribe = () => {
    const paywallId = 'your-hosted-paywall-id'; // 🧠 Replace this with your real Hosted Paywall ID
    const returnUrl = encodeURIComponent(`${window.location.origin}/subscription-success`);
    const hostedUrl = `https://paywall.revenuecat.com/paywalls/${paywallId}?app_user_id=${userId}&return_url=${returnUrl}`;

    window.location.href = hostedUrl;
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Unlock SkillLink AI Pro
        </Typography>
        <Typography color="text.secondary" fontSize={20}>
          Get more value, more features, and more results. Choose your plan below.
        </Typography>
      </Box>
      <Grid container spacing={4} justifyContent="center" alignItems="flex-end">
        {/* Free Plan */}
        <div className='md-4'>
          <Card elevation={2} sx={{ border: '2px solid #e0e0e0', position: 'relative', minHeight: 420 }}>
            <CardContent>
              <Chip label="Current Plan" color="default" sx={{ position: 'absolute', top: 16, right: 16 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>Free</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">$0</Typography>
              <Typography color="text.secondary" mb={2}>Basic access to SkillLink AI</Typography>
              <Divider sx={{ my: 2 }} />
              <Box component="ul" sx={{ pl: 2, fontSize: '1rem', mb: 2 }}>
                <li>3 skill exchanges/month</li>
                <li>1 AI coaching session/month</li>
                <li>Basic analytics</li>
                <li>Community access</li>
              </Box>
            </CardContent>
            <CardActions>
              <Button fullWidth variant="outlined" disabled>Current Plan</Button>
            </CardActions>
          </Card>
        </div>
        {/* Paid Plans */}
        {plans.map((plan, idx) => (
          <div className='md-4' key={plan.id}>
            <Card elevation={6} sx={{ border: '2px solid #6366f1', position: 'relative', minHeight: 420, background: 'linear-gradient(135deg, #e0e7ff 0%, #fff 100%)' }}>
              <CardContent>
                <Chip label="Premium" color="primary" sx={{ position: 'absolute', top: 16, right: 16 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>{plan.title}</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">{plan.price}</Typography>
                <Typography color="text.secondary" mb={2}>Unlock all features</Typography>
                <Divider sx={{ my: 2 }} />
                <Box component="ul" sx={{ pl: 2, fontSize: '1rem', mb: 2 }}>
                  {plan.features.map((f) => (
                    <li key={f}>✅ {f}</li>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  color="primary"
                  sx={{ fontWeight: 'bold', fontSize: 18, py: 1.5, borderRadius: 2, boxShadow: 2 }}
                  onClick={handleSubscribe}
                >
                  Upgrade to Pro
                </Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </Grid>
      <Box sx={{ textAlign: 'center', mt: 8, color: 'text.secondary' }}>
        <Typography variant="body2">
          Cancel anytime. Your subscription is managed securely by RevenueCat.
        </Typography>
      </Box>
    </Container>
  );
}
