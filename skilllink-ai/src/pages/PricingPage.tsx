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
    price: '$109.64/mo',
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
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography textAlign="center" color="text.secondary" mb={6}>
        Unlock full SkillLink AI power.
      </Typography>

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <div className='plan-card md:flex-1' key={plan.id}>
            <Card elevation={4}>
              <CardContent>
                <Chip label="Premium" color="primary" size="small" />
                <Typography variant="h6" fontWeight="bold" mt={1}>{plan.title}</Typography>
                <Typography color="text.secondary">{plan.price}</Typography>
                <Divider sx={{ my: 1 }} />
                <Box component="ul" sx={{ pl: 2, fontSize: '0.875rem' }}>
                  {plan.features.map((f) => (
                    <li key={f}>✅ {f}</li>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleSubscribe()}
                >
                  Subscribe
                </Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </Grid>
    </Container>
  );
}
