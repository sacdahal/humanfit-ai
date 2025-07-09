import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TryonViewer from '../components/TryonViewer';

export default function TryonResultPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let interval;
    async function pollStatus() {
      try {
        const res = await fetch(`/tryon/status/${taskId}`);
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (data.status === 'done') {
          setResult(data.result);
          setLoading(false);
          setError(null);
          clearInterval(interval);
        } else if (data.status === 'failed' || data.status === 'error') {
          setError(data.error || 'Try-on failed.');
          setLoading(false);
          clearInterval(interval);
        }
      } catch (e) {
        setError('Network or server error.');
        setLoading(false);
        clearInterval(interval);
      }
    }
    interval = setInterval(pollStatus, 2000);
    return () => clearInterval(interval);
  }, [taskId, retryCount]);

  if (loading) return <div role="status" aria-live="polite"><span className="spinner" aria-label="Loading" /> Processing your try-on... Please wait.</div>;
  if (error) return (
    <div role="alert" style={{ color: 'red' }}>
      {error}
      <button onClick={() => { setLoading(true); setError(null); setRetryCount(c => c + 1); }}>Retry</button>
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
  if (!result) return <div>Try-on failed or not found.</div>;

  return (
    <div>
      <h2>3D Try-On Result</h2>
      <TryonViewer meshUrl={result.mesh_url} fallbackImage={result.render_url} style={{ width: '80vw', height: '70vh', borderRadius: '16px', boxShadow: '0 4px 24px #0008' }} />
      <div style={{ marginTop: 24 }}>
        <a href={result.render_url} download aria-label="Download rendered image">
          <button>Download Image</button>
        </a>
        <a href={result.mesh_url} download aria-label="Download 3D mesh">
          <button>Download 3D Mesh</button>
        </a>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
}
