import React from 'react';
import GarmentsPage from './pages/GarmentsPage';
import AvatarDefinitionPage from './pages/AvatarDefinitionPage';

export default function GarmentsPageWrapper() {
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('humanfit_user'));
    } catch { return null; }
  }, []);
  const token = user && user.access_token;
  if (!user || !token) return <div>Please login first.</div>;
  return <GarmentsPage user={user} token={token} />;
}
