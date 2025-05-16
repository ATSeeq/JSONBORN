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


    const handleChange = useCallback((data: IChangeEvent<any>) => {
        debouncedSetFormDataRef.current?.(data.formData);
    }, []);

    const handleSubmit = useCallback(
        (data: IChangeEvent<any>) => {
            const jsonString = JSON.stringify(data.formData, null, 2);
            navigate('/generated-json', { state: { json: jsonString } });
        },
        [navigate]
    );

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

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
                    Back to Schema Input
                </Button>
                <Typography variant="h5">{schema.title || schema.$id || 'Untitled Schema'}</Typography>
            </Box>
            <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
                <Form
                    schema={schema}
                    validator={validator}
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    liveValidate={false}
                    omitExtraData={true}
                    noHtml5Validate={true}
                />
            </Box>
        </Box>
    );
}
