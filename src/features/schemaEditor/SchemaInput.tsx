import { Alert, Autocomplete, Box, Button, CircularProgress, FormControl, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FormIcon from '@mui/icons-material/EditDocument';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useNavigate } from 'react-router-dom';
import {
    loadAndResolveSchema,
    selectAvailableSchemaIds,
    selectCurrentSchemaId,
    selectError,
    selectIsLoading,
    selectOriginalSchemaInput,
    selectResolvedSchema,
    selectSchemaImporter,
    setOriginalSchemaInput,
} from './schemaSlice';
import { useEffect, useState } from 'react';
import { SchemaTextField } from './SchemaTextField';

export function SchemaInput() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const rawInput = useAppSelector(selectOriginalSchemaInput);
    const currentId = useAppSelector(selectCurrentSchemaId);
    const isLoading = useAppSelector(selectIsLoading);
    const error = useAppSelector(selectError);
    const resolvedSchema = useAppSelector(selectResolvedSchema);
    const availableIds = useAppSelector(selectAvailableSchemaIds);

    const [selectedId, setSelectedId] = useState<string>(currentId || '');

    useEffect(() => {
        // If an ID is already in Redux (e.g. from successful paste/parse), sync local select
        if (currentId && currentId !== selectedId) {
            setSelectedId(currentId);
        }
    }, [currentId, selectedId]);

    const handleSchemaSelect = async (newValue: string | null) => {
        const schemaId = newValue || '';
        setSelectedId(schemaId);

        if (schemaId) {
            try {
                const importer = selectSchemaImporter(schemaId);
                if (importer) {
                    const module = await importer();
                    const schemaObject = (module as any).default || module;
                    const stringifiedSchema = JSON.stringify(schemaObject, null, 2);
                    dispatch(setOriginalSchemaInput({ input: stringifiedSchema, id: schemaId }));
                } else {
                    console.error(`Importer not found for schema ID: ${schemaId}`);
                    dispatch(setOriginalSchemaInput({ input: '', id: null }));
                }
            } catch (e: any) {
                console.error(`Error loading schema content for ${schemaId}:`, e);
                dispatch(setOriginalSchemaInput({ input: `Error loading ${schemaId}`, id: schemaId }));
            }
        } else {
            dispatch(setOriginalSchemaInput({ input: '', id: null })); // Clear if "None" selected
        }
    };

    const handleManualInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(setOriginalSchemaInput({ input: e.target.value, id: currentId }));
    };

    const handleSubmit = () => {
        if (rawInput.trim()) {
            dispatch(loadAndResolveSchema({ schemaSource: rawInput, sourceId: currentId || undefined }));
        } else {
            alert('Schema input is empty.');
        }
    };

    return (
        <Box
            sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '80vw',
                maxWidth: '1400px',
                minWidth: '350px',
                mx: 'auto',
            }}
        >
            <FormControl fullWidth>
                <Autocomplete
                    id="schema-select"
                    options={['', ...availableIds]}
                    value={selectedId}
                    onChange={(_, newValue) => handleSchemaSelect(newValue)}
                    renderInput={params => (
                        <TextField
                            {...params}
                            size="medium"
                            variant="outlined"
                            label="Search Schema by $id"
                            slotProps={{
                                input: {
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <FolderOpenIcon sx={{ mr: 1, color: 'action.active' }} />
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                },
                            }}
                        />
                    )}
                    renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                            <li key={key} {...otherProps}>
                                {option === '' ? <em>None (or paste below)</em> : option}
                            </li>
                        );
                    }}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                />
            </FormControl>

            <SchemaTextField
                label="JSON Schema Input (or edit loaded file)"
                value={rawInput}
                onChange={handleManualInputChange}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isLoading || !rawInput.trim()}
                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                >
                    {isLoading ? 'Processing...' : 'Process Schema'}
                </Button>
                {isLoading && <Typography variant="caption">Parsing and resolving...</Typography>}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    <strong>Error processing schema:</strong> {error}
                    {currentId && (
                        <Typography variant="caption" display="block">
                            Schema $id: {currentId}
                        </Typography>
                    )}
                </Alert>
            )}

            {resolvedSchema && !error && (
                <>
                    <SchemaTextField
                        label={`Successfully parsed schema`}
                        value={JSON.stringify(resolvedSchema, null, 2)}
                        onChange={handleManualInputChange}
                        customColor="success.main"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FormIcon />}
                        onClick={() => navigate('/form')}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        Generate Form
                    </Button>
                </>
            )}
        </Box>
    );
}
