// src/pages/Signup.tsx
import AuthForm from '../components/AuthForm';
import { Container, Paper, Typography, Link as MuiLink } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Signup() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Paper elevation={4} sx={{ padding: 4, borderRadius: 4 }}>
          <AuthForm mode="signup" />
          <Typography variant="body2" textAlign="center" mt={3}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" color="primary">
              Log in
            </MuiLink>
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
}
