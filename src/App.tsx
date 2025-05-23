import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SchemaInput } from './features/schemaEditor/SchemaInput';
import { SchemaForm } from './features/schemaEditor/SchemaForm';
import { GeneratedJsonView } from './features/schemaEditor/GeneratedJsonView';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SchemaInput />} />
                <Route path="/form" element={<SchemaForm />} />
                <Route path="/generated-json" element={<GeneratedJsonView />} />
            </Routes>
        </Router>
    );
}

export default App;
