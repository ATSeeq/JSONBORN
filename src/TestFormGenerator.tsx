import Form from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useState } from 'react';
// import lineSegmentsSchema from '../src/assets/cleaned-line-segments.schema.json'
import triangleMeshSchema from '../src/assets/cleaned-triangle.mesh.schema.json';

// const schema: RJSFSchema = {
//     title: 'Todo',
//     type: 'object',
//     required: ['title'],
//     properties: {
//         title: { type: 'string', title: 'Title', default: 'A new task' },
//         done: { type: 'boolean', title: 'Done?', default: false },
//     },
// };

// const schema1 = lineSegmentsSchema as RJSFSchema;
const schema1 = triangleMeshSchema;

export default function TestFormGenerator() {
    const [formData, setFormData] = useState(null);

    return (
        <Form
            schema={schema1 as RJSFSchema}
            validator={validator}
            formData={formData}
            onChange={e => {
                setFormData(e.formData);
                console.log('changed');
            }}
            onSubmit={() => {
                console.log('submitted');
            }}
            onError={errors => {
                console.log('errors', errors);
            }}
        />
    );
}
// render(
//   <Form
//     schema={schema}
//     validator={validator}
//     onChange={log('changed')}
//     onSubmit={log('submitted')}
//     onError={log('errors')}
//   />,
//   document.getElementById('app')
// );
