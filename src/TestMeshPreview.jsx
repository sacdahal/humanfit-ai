import React, { useState } from 'react';
import MeshPreview from './MeshPreview';

export default function TestMeshPreview() {
  const [meshUrl, setMeshUrl] = useState('');
  const [form, setForm] = useState({
    gender: 'male',
    height_cm: 180,
    chest_cm: 100,
    waist_cm: 80,
    hips_cm: 95,
    neck_cm: 38,
    inseam_cm: 80,
    arm_length_cm: 60,
    leg_length_cm: 90,
    shoulder_cm: 40,
    thigh_cm: 55,
    bicep_cm: 30,
    forearm_cm: 25,
    calf_cm: 35
  });
  const [loading, setLoading] = useState(false);
  const backendUrl = 'http://127.0.0.1:8000';

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMeshUrl('');
    const res = await fetch(backendUrl + '/generate_mesh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    let meshUrl = data.mesh_url;
    if (meshUrl && !meshUrl.startsWith('http')) {
      meshUrl = backendUrl + meshUrl;
    }
    setMeshUrl(meshUrl);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Test 3D Mesh Avatar Generation</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {Object.keys(form).map(key => (
            <label key={key} style={{ flex: '1 0 45%' }}>
              {key.replace('_cm', '').replace('_', ' ')}
              <input
                type={typeof form[key] === 'number' ? 'number' : 'text'}
                name={key}
                value={form[key]}
                onChange={handleChange}
                step="any"
                required
              />
            </label>
          ))}
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Generating...' : 'Generate Mesh'}
        </button>
      </form>
      {meshUrl && (
        <div style={{ marginTop: 32 }}>
          <h3>3D Mesh Preview</h3>
          <MeshPreview meshUrl={meshUrl} />
        </div>
      )}
    </div>
  );
}
