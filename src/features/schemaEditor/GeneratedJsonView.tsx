import { Box, Typography, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SchemaTextField } from './SchemaTextField';

export function GeneratedJsonView() {
    const navigate = useNavigate();
    const location = useLocation();
    const json = location.state?.json || '';

    return (
        <Box sx={{ p: 2, width: '80vw', maxWidth: '1400px', minWidth: '350px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                    Back
                </Button>
                <Typography variant="h5">Generated JSON</Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
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
