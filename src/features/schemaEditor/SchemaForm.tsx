import { Box, Typography, Button } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { selectResolvedSchema } from './schemaSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useState } from 'react';
import type { IChangeEvent } from '@rjsf/core';

export function SchemaForm() {
    const schema = useAppSelector(selectResolvedSchema);
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});

    if (!schema) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">No schema available. Please parse a schema first.</Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Back to Schema Input
                </Button>
            </Box>
        );
    }

    const handleSubmit = (data: IChangeEvent<any>) => {
        console.log('Form submitted:', data.formData);
        // TODO: Handle form submission
    };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
                    Back to Schema Input
                </Button>
                <Typography variant="h5">Form Generated from Schema</Typography>
            </Box>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
                <Form
                    schema={schema}
                    validator={validator}
                    formData={formData}
                    onChange={data => setFormData(data.formData)}
                    onSubmit={handleSubmit}
                />
            </Box>
        </Box>
    );
}
