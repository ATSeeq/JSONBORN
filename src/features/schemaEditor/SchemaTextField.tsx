import { TextField } from '@mui/material';
import type { TextFieldProps, SxProps, Theme } from '@mui/material';

interface SchemaTextFieldProps extends Omit<TextFieldProps, 'sx'> {
    customColor?: string;
    sx?: SxProps<Theme>;
}

export function SchemaTextField({ customColor, sx, ...props }: SchemaTextFieldProps) {
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
                ...sx,
            }}
        />
    );
}
