import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import TryonResultPage from './pages/TryonResultPage';
import SignupPage from './pages/SignupPage';
import AvatarDefinitionPage from './pages/AvatarDefinitionPage';
import GarmentsPageWrapper from './GarmentsPageWrapper';

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/define-avatar" element={<AvatarDefinitionPageWrapper />} />
        <Route path="/garments" element={<GarmentsPageWrapper />} />
        <Route path="/tryon/result/:taskId" element={<TryonResultPage />} />
        <Route path="*" element={<div style={{color:'white',padding:40}}>No route matched. Debug: Router is working.</div>} />
      </Routes>
    </BrowserRouter>
  );
}

function AvatarDefinitionPageWrapper() {
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('humanfit_user'));
    } catch { return null; }
  }, []);
  const token = user && user.access_token;
  if (!user || !token) return <div>Please login first.</div>;
  return <AvatarDefinitionPage user={user} token={token} />;
}