import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SchemaTextField } from './SchemaTextField';

export function GeneratedJsonView() {
    const navigate = useNavigate();
    const location = useLocation();
    const json = location.state?.json || '';

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back to Form
                </Button>
                <Typography variant="h5">Generated JSON</Typography>
            </Box>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
                <SchemaTextField
                    value={json}
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    customColor="#2196f3"
                    sx={{
                        '& .MuiInputBase-input': {
                            whiteSpace: 'pre',
                            overflowX: 'auto',
                            overflowY: 'auto',
                        },
                    }}
                />
            </Box>
        </Box>
    );
}
