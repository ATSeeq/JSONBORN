import { Box, Typography, Button, Autocomplete, TextField } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { selectResolvedSchema } from './schemaSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { withTheme } from '@rjsf/core';
import { Theme as MuiTheme } from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { IChangeEvent } from '@rjsf/core';
import debounce from 'lodash/debounce';
import type { FieldProps } from '@rjsf/utils';

type DebouncedFunction = {
    (data: any): void;
    cancel: () => void;
};

const Form = withTheme(MuiTheme);

const UnitFieldTemplate = (props: FieldProps) => {
    const [comment, setComment] = useState('');
    const [description, setDescription] = useState('');
    const [units, setUnits] = useState([]);

    useEffect(() => {
        setComment(props.schema.$comment);
        if (props.schema.enum) {
            setDescription(props.schema.description);
            setUnits(props.schema.enum);
        }
    }, [props.schema]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>{description || comment}</Typography>
            {units.length > 0 ? (
                <Autocomplete
                    sx={{ width: '100%' }}
                    options={units}
                    renderInput={params => <TextField {...params} />}
                />
            ) : (
                <></>
            )}
        </Box>
    );
};

export function SchemaForm() {
    const rawSchema = useAppSelector(selectResolvedSchema);
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({});

    // Memoize the schema to prevent unnecessary re-renders
    const schema = useMemo(() => rawSchema, [rawSchema]);

    // Create a ref to store the debounced function
    const debouncedSetFormDataRef = useRef<DebouncedFunction | null>(null);

    // Set up the debounced function in useEffect
    useEffect(() => {
        debouncedSetFormDataRef.current = debounce((data: any) => {
            setFormData(data);
        }, 100);

        // Cleanup function to cancel any pending debounced calls
        return () => {
            debouncedSetFormDataRef.current?.cancel();
        };
    }, []);

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

    const uiSchema = {
        unit: {
            'ui:field': UnitFieldTemplate,
        },
    };

    if (!schema) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography color="error">No schema available. Please parse a schema first.</Typography>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    Back
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, width: '80vw', maxWidth: '1400px', minWidth: '350px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                    sx={{ width: '100px', flexShrink: 0, flexGrow: 0 }}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                >
                    Back
                </Button>
                <Typography variant="h5">{schema.title || schema.$id || 'Untitled Schema'}</Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    validator={validator}
                    formData={formData}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    templates={
                        {
                            // FieldTemplate: CustomFieldTemplate,
                            // ObjectFieldTemplate: CustomObjectFieldTemplate,
                        }
                    }
                    liveValidate={false}
                    omitExtraData={true}
                    noHtml5Validate={true}
                />
            </Box>
        </Box>
    );
}
