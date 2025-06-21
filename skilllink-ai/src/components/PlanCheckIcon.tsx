import { CheckCircle2 } from 'lucide-react';
import { Box } from '@mui/material';

export default function PlanCheckIcon() {
  return (
    <Box component="span" sx={{ color: 'primary.main', verticalAlign: 'middle', mr: 1, display: 'inline-flex', alignItems: 'center' }}>
      <CheckCircle2 size={20} />
    </Box>
  );
}
