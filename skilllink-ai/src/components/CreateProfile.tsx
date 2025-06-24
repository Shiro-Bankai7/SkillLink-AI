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
  const [lookingfor, setLookingfor] = useState('');
  const [role, setRole] = useState<'learner' | 'teacher' | 'both'>('both');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [github, setGithub] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
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
        location,
        website,
        social_links: { linkedin, twitter, github },
        preferences: {
          email_notifications: emailNotifications,
          session_reminders: sessionReminders,
          marketing_emails: marketingEmails
        },
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
        onChange={(e) => setLookingfor(e.target.value)}
      />
      <TextField
        label="Location"
        fullWidth
        margin="normal"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <TextField
        label="Website"
        fullWidth
        margin="normal"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <TextField
        label="LinkedIn"
        fullWidth
        margin="normal"
        value={linkedin}
        onChange={(e) => setLinkedin(e.target.value)}
      />
      <TextField
        label="Twitter"
        fullWidth
        margin="normal"
        value={twitter}
        onChange={(e) => setTwitter(e.target.value)}
      />
      <TextField
        label="GitHub"
        fullWidth
        margin="normal"
        value={github}
        onChange={(e) => setGithub(e.target.value)}
      />
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <label>
          <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} /> Email Notifications
        </label>
        <label>
          <input type="checkbox" checked={sessionReminders} onChange={e => setSessionReminders(e.target.checked)} /> Session Reminders
        </label>
        <label>
          <input type="checkbox" checked={marketingEmails} onChange={e => setMarketingEmails(e.target.checked)} /> Marketing Emails
        </label>
      </Box>

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
