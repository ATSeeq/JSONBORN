import { Box, Typography, Button } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { selectResolvedSchema } from './schemaSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export function SchemaForm() {
    const schema = useAppSelector(selectResolvedSchema);
    const navigate = useNavigate();

    if (!schema) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">No schema available. Please parse a schema first.</Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Schema Input
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Back to Schema Input
                </Button>
                <Typography variant="h5">
                    Form Generated from Schema
                </Typography>
            </Box>
            <pre>{JSON.stringify(schema, null, 2)}</pre>
            {/* TODO: Implement actual form generation */}
        </Box>
    );
} 