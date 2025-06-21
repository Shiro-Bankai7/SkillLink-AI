// src/pages/CreateProfile.tsx
import {
  Container,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Chip,
  Box,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const allSkills = ['UI/UX', 'Public Speaking', 'Design', 'Programming', 'Sales', 'Music', 'Language', 'Video Editing'];

export default function CreateProfile() {
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [lookingfor, setLookingFor] = useState('');
  const [role, setRole] = useState<'learner' | 'teacher' | 'both'>('both');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    // Ensure session is available and user is confirmed
    const session = (await supabase.auth.getSession()).data.session;
    if (!session || !session.user) {
      alert('You must be logged in and have a confirmed email to create your profile. Please check your email for a confirmation link.');
      return;
    }
    const user = session.user;
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        bio,
        skills,
        lookingfor,
        role,
        plan: 'free', // Default to free plan
      });

    if (!error) {
      navigate('/pricing');
    } else {
      console.error(error.message);
      alert('Profile creation failed: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Let’s Build Your Profile
      </Typography>

      <TextField
        label="Short Bio"
        fullWidth
        multiline
        rows={3}
        margin="normal"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <Autocomplete
        multiple
        options={allSkills}
        value={skills}
        onChange={(_, value) => setSkills(value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip {...getTagProps({ index })} key={option} label={option} />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Your Skills" />}
        sx={{ mt: 2 }}
      />

      <TextField
        label="What are you looking to learn or exchange?"
        fullWidth
        margin="normal"
        value={lookingfor}
        onChange={(e) => setLookingFor(e.target.value)}
      />

      <TextField
        label="Your Role"
        select
        fullWidth
        margin="normal"
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        <MenuItem value="learner">Learner</MenuItem>
        <MenuItem value="teacher">Teacher</MenuItem>
        <MenuItem value="both">Both</MenuItem>
      </TextField>

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 4 }}
        onClick={handleSubmit}
      >
        Continue to Pricing
      </Button>
    </Container>
  );
}
