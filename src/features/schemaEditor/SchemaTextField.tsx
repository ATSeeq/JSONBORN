import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

interface SchemaTextFieldProps extends Omit<TextFieldProps, 'sx'> {
    customColor?: string;
}

export function SchemaTextField({ customColor, ...props }: SchemaTextFieldProps) {
    return (
        <TextField
            {...props}
            multiline
            rows={15}
            variant="outlined"
            fullWidth
            placeholder="Paste your JSON Schema here or select a file above..."
            sx={{
                '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    ...(customColor && { color: customColor }),
                },
                '& .MuiInputBase-input': {
                    whiteSpace: 'nowrap',
                    overflowX: 'auto',
                    scrollbarWidth: 'thin',
                },
            }}
        />
    );
}
