import { Alert, Autocomplete, Box, Button, CircularProgress, FormControl, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
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

export function SchemaInput() {
    const dispatch = useAppDispatch();
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
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: '600px', maxWidth: '1000px' }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Load JSON Schema
            </Typography>

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
                    renderOption={(props, option) => (
                        <li {...props}>{option === '' ? <em>None (or paste below)</em> : option}</li>
                    )}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                />
            </FormControl>

            <TextField
                label="JSON Schema Input (or edit loaded file)"
                multiline
                rows={15}
                value={rawInput}
                onChange={handleManualInputChange}
                variant="outlined"
                fullWidth
                placeholder="Paste your JSON Schema here or select a file above..."
                sx={{
                    '& .MuiInputBase-root': {
                        fontFamily: 'monospace',
                        fontSize: '12px',
                    },
                    '& .MuiInputBase-input': {
                        whiteSpace: 'nowrap',
                        overflowX: 'auto',
                        scrollbarWidth: 'thin',
                    },
                }}
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
                <TextField
                    label={`Successfully parsed schema`}
                    multiline
                    rows={15}
                    value={JSON.stringify(resolvedSchema, null, 2)}
                    onChange={handleManualInputChange}
                    variant="outlined"
                    fullWidth
                    placeholder="Paste your JSON Schema here or select a file above..."
                    sx={{
                        '& .MuiInputBase-root': {
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: 'success.main',
                        },
                        '& .MuiInputBase-input': {
                            whiteSpace: 'nowrap',
                            overflowX: 'auto',
                            scrollbarWidth: 'thin',
                        },
                    }}
                />
            )}
        </Box>
    );
}
