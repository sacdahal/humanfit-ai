import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TestMeshPreview from './TestMeshPreview';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test-mesh" element={<TestMeshPreview />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
