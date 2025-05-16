import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { Resolver } from '@stoplight/json-ref-resolver';
import URI from 'urijs';

export type JsonSchema = Record<string, any>;

export interface SchemaState {
    originalSchemaInput: string;
    currentSchemaId: string | null;
    resolvedSchema: JsonSchema | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: SchemaState = {
    originalSchemaInput: '',
    currentSchemaId: null,
    resolvedSchema: null,
    isLoading: false,
    error: null,
};

// --- VITE GLOB IMPORT ---
// This glob imports all .schema.json files under src/assets/schema
// It returns a map where keys are actual file system paths (e.g., /src/assets/schema/...)
// and values are functions that return a Promise resolving to the module.
const rawFileImporters = import.meta.glob('../../assets/schema/**/*.schema.json') as Record<
    string,
    () => Promise<{ default: JsonSchema } | JsonSchema>
>;

// --- SCHEMA ID TO IMPORTER MAPPING ---
// We need to map the schema $id (e.g., "/objects/foo/v1/foo.schema.json")
// to the actual importer function.
const SCHEMA_BASE_PATH_PREFIX = '../../assets/schema';

const idToImporterMap = new Map<string, () => Promise<any>>();
const idToActualPathMap = new Map<string, string>(); // For debugging or other uses
const availableSchemaIds: string[] = [];

for (const filePath in rawFileImporters) {
    // Convert file system path to the $id style path
    // e.g., /src/assets/schemas/objects/foo/v1/foo.schema.json -> /objects/foo/v1/foo.schema.json
    if (filePath.startsWith(SCHEMA_BASE_PATH_PREFIX) && filePath.endsWith('.schema.json')) {
        const schemaId = filePath.substring(SCHEMA_BASE_PATH_PREFIX.length);
        idToImporterMap.set(schemaId, rawFileImporters[filePath]!);
        idToActualPathMap.set(schemaId, filePath);
        availableSchemaIds.push(schemaId);
    } else {
    }
}
// Sort for consistent display in UI
availableSchemaIds.sort();

const hasRefs = (schema: JsonSchema): boolean => {
    return JSON.stringify(schema).includes('"$ref"');
};

export const loadAndResolveSchema = createAsyncThunk<
    JsonSchema,
    { schemaSource: string | JsonSchema; sourceId: string | undefined },
    { rejectValue: string }
>('schema/loadAndResolve', async ({ schemaSource }, { rejectWithValue }) => {
    try {
        let schemaObject: JsonSchema;

        if (typeof schemaSource === 'string') {
            try {
                schemaObject = JSON.parse(schemaSource) as JsonSchema;
            } catch (error: any) {
                return rejectWithValue(error.message || 'Invalid JSON format');
            }
        } else {
            schemaObject = schemaSource;
        }

        const resolver = new Resolver({
            resolvers: {
                file: {
                    resolve: async ref => {
                        const refStr = ref.toString();
                        const importer = idToImporterMap.get(refStr);
                        if (importer) {
                            try {
                                const module = await importer();
                                return (module as any).default || module;
                            } catch (e) {
                                console.error(`Error importing ${refStr}:`, e);
                                throw new Error(`Failed to import module for ${refStr}`);
                            }
                        }
                        throw new Error(`No importer found for ${refStr}`);
                    },
                },
            },
        });

        try {
            let result = await resolver.resolve(schemaObject, {
                transformRef(opts) {
                    return new URI(opts.val.$ref);
                },
            });

            if (result.errors.length > 0) {
                console.error('Resolution errors:', result.errors);
                return rejectWithValue(result.errors[0]?.message || 'Failed to resolve schema references.');
            }

            // Keep resolving until no more $refs are found
            let resolvedSchema = result.result;
            let passCount = 1;
            const MAX_PASSES = 4;

            while (hasRefs(resolvedSchema)) {
                if (passCount >= MAX_PASSES) {
                    return rejectWithValue('Schema contains unresolved $refs after maximum resolution attempts. The schema may have circular references or invalid references.');
                }

                result = await resolver.resolve(resolvedSchema, {
                    transformRef(opts) {
                        return new URI(opts.val.$ref);
                    },
                });
                
                if (result.errors.length > 0) {
                    console.error('Resolution errors in subsequent pass:', result.errors);
                    return rejectWithValue(result.errors[0]?.message || 'Failed to resolve schema references in subsequent pass.');
                }
                
                resolvedSchema = result.result;
                passCount++;
            }

            return resolvedSchema;
        } catch (resolveError: any) {
            console.error('Resolution error:', resolveError);
            // If resolution fails, return the original schema as a fallback
            return schemaObject;
        }
    } catch (err: any) {
        console.error('Schema processing error:', err);
        return rejectWithValue(err.message || 'Failed to resolve schema references.');
    }
});

export const schemaSlice = createSlice({
    name: 'schema',
    initialState,
    reducers: {
        setOriginalSchemaInput: (state, action: PayloadAction<{ input: string; id?: string | null }>) => {
            state.originalSchemaInput = action.payload.input;
            state.currentSchemaId = action.payload.id || null;
            state.resolvedSchema = null;
            state.error = null;
        },
        clearSchema: () => initialState,
    },
    extraReducers: builder => {
        builder.addCase(loadAndResolveSchema.pending, state => {
            state.isLoading = true;
            state.resolvedSchema = null;
            state.error = null;
        });
        builder.addCase(loadAndResolveSchema.fulfilled, (state, action: PayloadAction<JsonSchema>) => {
            state.isLoading = false;
            state.resolvedSchema = action.payload;
            state.error = null;
            // If the resolved schema has an $id, and we didn't have one from selection, update currentSchemaId
            if (!state.currentSchemaId && action.payload.$id && typeof action.payload.$id === 'string') {
                if (idToImporterMap.has(action.payload.$id)) {
                    // Check if it's one of our known $ids
                    state.currentSchemaId = action.payload.$id;
                }
            }
        });
        builder.addCase(loadAndResolveSchema.rejected, (state, action) => {
            state.isLoading = false;
            state.resolvedSchema = null;
            state.error = action.payload || 'Failed to resolve schema';
        });
    },
});

export const { setOriginalSchemaInput, clearSchema } = schemaSlice.actions;
export const selectOriginalSchemaInput = (state: RootState) => state.schema.originalSchemaInput;
export const selectCurrentSchemaId = (state: RootState) => state.schema.currentSchemaId;
export const selectResolvedSchema = (state: RootState) => state.schema.resolvedSchema;
export const selectIsLoading = (state: RootState) => state.schema.isLoading;
export const selectError = (state: RootState) => state.schema.error;
export const selectAvailableSchemaIds = () => availableSchemaIds;
export const selectSchemaImporter = (schemaId: string) => idToImporterMap.get(schemaId);

export default schemaSlice.reducer;
