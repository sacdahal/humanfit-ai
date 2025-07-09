import React, { useState } from 'react';
import MeshPreview from './MeshPreview';

// Use unified field names with _cm suffix for all measurements
const MEASUREMENT_FIELDS = [
  { name: 'height_cm', label: 'Height*', minCm: 120, maxCm: 220, minIn: 47, maxIn: 87, smplx: true },
  { name: 'chest_cm', label: 'Chest*', minCm: 60, maxCm: 150, minIn: 24, maxIn: 59, smplx: true },
  { name: 'waist_cm', label: 'Waist*', minCm: 50, maxCm: 140, minIn: 20, maxIn: 55, smplx: true },
  { name: 'hips_cm', label: 'Hips*', minCm: 60, maxCm: 150, minIn: 24, maxIn: 59, smplx: true },
  { name: 'neck_cm', label: 'Neck*', minCm: 25, maxCm: 60, minIn: 10, maxIn: 24, smplx: true },
  { name: 'inseam_cm', label: 'Inseam*', minCm: 50, maxCm: 120, minIn: 20, maxIn: 47, smplx: true },
  { name: 'arm_length_cm', label: 'Arm Length*', minCm: 40, maxCm: 90, minIn: 16, maxIn: 35, smplx: true },
  { name: 'leg_length_cm', label: 'Leg Length*', minCm: 60, maxCm: 130, minIn: 24, maxIn: 51, smplx: true },
  { name: 'shoulder_cm', label: 'Shoulder*', minCm: 30, maxCm: 60, minIn: 12, maxIn: 24, smplx: true },
  { name: 'thigh_cm', label: 'Thigh*', minCm: 30, maxCm: 80, minIn: 12, maxIn: 31, smplx: true },
  { name: 'bicep_cm', label: 'Bicep', minCm: 20, maxCm: 60, minIn: 8, maxIn: 24, smplx: false },
  { name: 'forearm_cm', label: 'Forearm', minCm: 15, maxCm: 50, minIn: 6, maxIn: 20, smplx: false },
  { name: 'calf_cm', label: 'Calf', minCm: 20, maxCm: 60, minIn: 8, maxIn: 24, smplx: false },
];

const AVERAGE_CM = {
  height_cm: 170, chest_cm: 95, waist_cm: 80, hips_cm: 95, neck_cm: 38, inseam_cm: 80, arm_length_cm: 60, leg_length_cm: 90, shoulder_cm: 40, thigh_cm: 55, bicep_cm: 30, forearm_cm: 25, calf_cm: 35
};

function BodyDoubleForm({ user, onAvatarCreated, onLogout }) {
  const [unit, setUnit] = useState('cm');
  // Always update user_id in form state if user.id changes
  React.useEffect(() => {
    setForm(f => ({ ...f, user_id: user.id }));
  }, [user.id]);
  const [form, setForm] = useState({
    user_id: user.id,
    gender: 'male',
    pose: 't-pose',
    ...AVERAGE_CM
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mesh, setMesh] = useState({ mesh_url: '', texture_url: '' });
  const [previewReady, setPreviewReady] = useState(false);

  const toCm = (val) => unit === 'in' ? (parseFloat(val) * 2.54).toFixed(2) : val;
  const fromCm = (val) => unit === 'in' ? (parseFloat(val) / 2.54).toFixed(2) : val;

  // Convert all fields on unit change
  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    const converted = {};
    for (const field of MEASUREMENT_FIELDS) {
      let val = form[field.name];
      if (val === '' || isNaN(parseFloat(val))) val = AVERAGE_CM[field.name];
      converted[field.name] = newUnit === 'in' ? String(fromCm(val)) : String(toCm(val));
    }
    setUnit(newUnit);
    setForm({ ...form, ...converted });
  };

  // Reset to average values
  const handleReset = () => {
    const resetVals = {};
    for (const field of MEASUREMENT_FIELDS) {
      resetVals[field.name] = unit === 'in' ? String(fromCm(AVERAGE_CM[field.name])) : String(AVERAGE_CM[field.name]);
    }
    setForm({ ...form, ...resetVals });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value === '' ? '' : String(value) });
  };

  const validateFields = () => {
    for (const field of MEASUREMENT_FIELDS) {
      let val = form[field.name];
      if (val === '' || isNaN(parseFloat(val))) val = unit === 'in' ? fromCm(AVERAGE_CM[field.name]) : AVERAGE_CM[field.name];
      const min = unit === 'in' ? field.minIn : field.minCm;
      const max = unit === 'in' ? field.maxIn : field.maxCm;
      if (isNaN(parseFloat(val)) || parseFloat(val) < min || parseFloat(val) > max) {
        setError(`${field.label} must be between ${min} and ${max} ${unit}`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleGenerateMesh = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    // Always build payload with all required fields and valid values
    const payload = {};
    for (const field of MEASUREMENT_FIELDS) {
      let val = form[field.name];
      if (val === '' || isNaN(parseFloat(val))) val = unit === 'in' ? fromCm(AVERAGE_CM[field.name]) : AVERAGE_CM[field.name];
      payload[field.name] = parseFloat(toCm(val));
    }
    payload.gender = form.gender;
    payload.pose = form.pose;
    // Defensive: ensure all required fields are present and numbers
    const required = [
      'gender', 'height_cm', 'chest_cm', 'waist_cm', 'hips_cm', 'neck_cm',
      'inseam_cm', 'arm_length_cm', 'leg_length_cm', 'shoulder_cm', 'thigh_cm', 'bicep_cm', 'forearm_cm', 'calf_cm', 'pose'
    ];
    for (const key of required) {
      if (!(key in payload) || payload[key] === undefined || payload[key] === '' || (typeof payload[key] === 'number' && isNaN(payload[key]))) {
        setError(`Missing or invalid field: ${key}`);
        console.error('Payload missing/invalid:', key, payload);
        return;
      }
    }
    console.log('Mesh payload:', payload); // DEBUG LOG
    try {
      const res = await fetch('http://localhost:8000/generate_mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = 'Failed to generate mesh';
        try {
          const errData = await res.json();
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              // Pinpoint missing or invalid fields in the error message
              errMsg = errData.detail.map(d => {
                if (d.type === 'missing' && d.loc && d.loc.length > 1) {
                  return `Missing field: ${d.loc[d.loc.length-1]}`;
                } else if (d.type === 'type_error' && d.loc && d.loc.length > 1) {
                  return `Invalid type for field: ${d.loc[d.loc.length-1]}`;
                } else {
                  return d.msg;
                }
              }).join(', ');
            } else {
              errMsg = errData.detail;
            }
          } else {
            errMsg = JSON.stringify(errData);
          }
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      const backendUrl = 'http://127.0.0.1:8000';
      let meshUrl = data.mesh_url;
      if (meshUrl && !meshUrl.startsWith('http')) {
        meshUrl = backendUrl + meshUrl;
      }
      setMesh({ mesh_url: meshUrl, texture_url: data.texture_url });
      setPreviewReady(true);
      setError('');
    } catch (err) {
      setError('Generate Mesh Error: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!user || !user.id) {
      setError('User not found. Please log in again.');
      return;
    }
    if (!previewReady || !mesh.mesh_url) {
      setError('Please generate and preview your avatar before saving.');
      return;
    }
    // Build payload with all measurement fields for backend schema
    const payload = {
      user_id: user.id,
      mesh_url: mesh.mesh_url,
      texture_url: mesh.texture_url || null,
      gender: form.gender,
      pose: 't-pose', // Always use t-pose
    };
    // Add all measurement fields
    [
      'height_cm', 'chest_cm', 'waist_cm', 'hips_cm', 'neck_cm', 'inseam_cm',
      'arm_length_cm', 'leg_length_cm', 'shoulder_cm', 'thigh_cm', 'bicep_cm', 'forearm_cm', 'calf_cm'
    ].forEach(field => {
      payload[field] = parseFloat(toCm(form[field]));
    });
    console.log('Save avatar payload:', payload); // DEBUG LOG
    try {
      const res = await fetch('http://localhost:8000/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = 'Failed to save avatar';
        try {
          const errData = await res.json();
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              errMsg = errData.detail.map(d => d.msg).join(', ');
            } else {
              errMsg = errData.detail;
            }
          } else {
            errMsg = JSON.stringify(errData);
          }
        } catch {}
        throw new Error(errMsg);
      }
      setSuccess(true);
      setError('');
      if (onAvatarCreated) onAvatarCreated();
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('401')) {
        // Token invalid or expired, clear user and reload app
        localStorage.removeItem('humanfit_user');
        window.location.reload();
      }
      setError('Create Body Double Error: ' + err.message);
    }
  };

  // List of required DB fields for avatar
  const requiredDbFields = [
    'user_id', 'mesh_url', 'gender', 'height_cm', 'chest_cm', 'waist_cm', 'hips_cm', 'neck_cm', 'inseam_cm',
    'arm_length_cm', 'leg_length_cm', 'shoulder_cm', 'thigh_cm', 'bicep_cm', 'forearm_cm', 'calf_cm'
  ];
  // What we have in the payload
  const currentPayload = {
    user_id: user.id,
    mesh_url: mesh.mesh_url,
    gender: form.gender,
    height_cm: form.height_cm,
    chest_cm: form.chest_cm,
    waist_cm: form.waist_cm,
    hips_cm: form.hips_cm,
    neck_cm: form.neck_cm,
    inseam_cm: form.inseam_cm,
    arm_length_cm: form.arm_length_cm,
    leg_length_cm: form.leg_length_cm,
    shoulder_cm: form.shoulder_cm,
    thigh_cm: form.thigh_cm,
    bicep_cm: form.bicep_cm,
    forearm_cm: form.forearm_cm,
    calf_cm: form.calf_cm
  };
  // Highlight missing fields
  const missingFields = requiredDbFields.filter(f => !currentPayload[f] && currentPayload[f] !== 0);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', minHeight: 700 }}>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        {onLogout && (
          <button onClick={onLogout} style={{ padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 'bold' }}>Logout</button>
        )}
      </div>
      {/* Save button at the top */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 16, marginBottom: 8 }}>
        {previewReady && (
          <form onSubmit={handleSubmit} style={{ margin: 0 }}>
            <button type="submit" style={{ padding: '0.7rem 2rem', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 8 }}>Save Body Double</button>
          </form>
        )}
      </div>
      {/* Show required fields and what we have */}
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 1rem auto', background: '#222', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14 }}>
        <div><b>Required DB Fields:</b></div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {requiredDbFields.map(f => (
            <li key={f} style={{ color: missingFields.includes(f) ? 'salmon' : '#8f8' }}>{f}{missingFields.includes(f) ? ' (missing)' : ''}</li>
          ))}
        </ul>
      </div>
      <div style={{ flex: '1 1 350px', maxWidth: 400, margin: '2rem', background: '#181818', borderRadius: 16, boxShadow: '0 2px 16px #0002', padding: 24 }}>
        <form onSubmit={handleGenerateMesh} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Avatar Measurements</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <label style={{ flex: 1 }}>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="neutral">Neutral</option>
              </select>
            </label>
            {/* Pose dropdown removed, always use T-pose */}
            <input type="hidden" name="pose" value="t-pose" />
            <label style={{ flex: 1 }}>
              Units
              <select value={unit} onChange={handleUnitChange}>
                <option value="cm">cm</option>
                <option value="in">in</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MEASUREMENT_FIELDS.map(field => {
              const min = unit === 'in' ? field.minIn : field.minCm;
              const max = unit === 'in' ? field.maxIn : field.maxCm;
              return (
                <label key={field.name} style={{ flex: '1 0 45%' }}>
                  {field.label}
                  <input
                    type="number"
                    name={field.name}
                    value={form[field.name]}
                    min={min}
                    max={max}
                    step="any"
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                </label>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <button type="button" onClick={handleReset} style={{ padding: '0.5rem 1rem', borderRadius: 8 }}>Reset to Average</button>
            <button type="submit" style={{ padding: '0.7rem 1.5rem', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 8 }}>Generate Avatar Preview</button>
          </div>
          {error && (
            <div className="error-msg" style={{ color: 'salmon', textAlign: 'center' }}>{error}</div>
          )}
          {success && (
            <div className="success-msg" style={{ color: 'lightgreen', textAlign: 'center' }}>Body double created!</div>
          )}
        </form>
      </div>
      <div style={{ flex: '2 1 800px', minWidth: 320, maxWidth: 1200, margin: '2rem auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, wordBreak: 'break-word' }}>
            3D Avatar Preview for: <span style={{ color: '#4faaff' }}>{user.name || 'Unknown'} (ID: {user.id || 'N/A'}, Email: {user.email || 'N/A'})</span>
          </h3>
          {/* Show avatar meta if available */}
          {user.avatar && (
            <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
              Created: {user.avatar.created_at ? new Date(user.avatar.created_at).toLocaleString() : 'N/A'}<br />
              Last Updated: {user.avatar.updated_at ? new Date(user.avatar.updated_at).toLocaleString() : 'N/A'}
            </div>
          )}
          {previewReady && (
            <form onSubmit={handleSubmit} style={{ margin: 0 }}>
              <button type="submit" style={{ padding: '0.7rem', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 8, marginLeft: 16 }}>Save Body Double</button>
            </form>
          )}
        </div>
        <div style={{ width: '100%', maxWidth: 900, height: '60vw', maxHeight: 900, background: '#222', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {mesh.mesh_url && <MeshPreview meshUrl={mesh.mesh_url} textureUrl={mesh.texture_url} showFitToViewTop />}
        </div>
      </div>
    </div>
  );
}

export default BodyDoubleForm;
