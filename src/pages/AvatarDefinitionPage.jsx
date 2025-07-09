import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MeshPreview from '../MeshPreview';

// Average values (cm) for adult male/female
const AVERAGE_MALE = {
  gender: 'male',
  height_cm: 175,
  chest_cm: 98,
  waist_cm: 86,
  hips_cm: 99,
  neck_cm: 39,
  inseam_cm: 81,
  arm_length_cm: 62,
  leg_length_cm: 92,
  shoulder_cm: 46,
  thigh_cm: 56,
  bicep_cm: 32,
  forearm_cm: 27,
  calf_cm: 37
};
const AVERAGE_FEMALE = {
  gender: 'female',
  height_cm: 162,
  chest_cm: 90,
  waist_cm: 74,
  hips_cm: 102,
  neck_cm: 34,
  inseam_cm: 76,
  arm_length_cm: 58,
  leg_length_cm: 86,
  shoulder_cm: 41,
  thigh_cm: 54,
  bicep_cm: 28,
  forearm_cm: 24,
  calf_cm: 34
};

function toCm(val, unit) {
  if (unit === 'in') return Math.round(Number(val) * 2.54 * 10) / 10;
  return Number(val);
}

export default function AvatarDefinitionPage({ user, token }) {
  const [unit, setUnit] = useState('cm');
  const [form, setForm] = useState({ ...AVERAGE_MALE });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [meshUrl, setMeshUrl] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const navigate = useNavigate();
  const meshPreviewRef = useRef();

  const handleChange = e => {
    let { name, value } = e.target;
    // Convert to cm if unit is inches and it's a measurement field
    if (unit === 'in' && name.endsWith('_cm')) {
      value = toCm(value, 'in');
    }
    setForm({ ...form, [name]: value });
  };

  const handleUnitChange = e => {
    const newUnit = e.target.value;
    setUnit(newUnit);
    // If switching to inches, convert all cm fields to inches for display
    if (newUnit === 'in') {
      const toInches = v => v ? Math.round((Number(v) / 2.54) * 10) / 10 : '';
      setForm(f => {
        const updated = { ...f };
        Object.keys(updated).forEach(k => {
          if (k.endsWith('_cm')) updated[k] = toInches(updated[k]);
        });
        return updated;
      });
    } else {
      // If switching to cm, convert all fields back to cm
      setForm(f => {
        const updated = { ...f };
        Object.keys(updated).forEach(k => {
          if (k.endsWith('_cm')) updated[k] = toCm(updated[k], 'in');
        });
        return updated;
      });
    }
  };

  const handlePreset = gender => {
    setForm(gender === 'male' ? { ...AVERAGE_MALE } : { ...AVERAGE_FEMALE });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    // Always send cm to backend
    const cmForm = { ...form };
    if (unit === 'in') {
      Object.keys(cmForm).forEach(k => {
        if (k.endsWith('_cm')) cmForm[k] = toCm(cmForm[k], 'in');
      });
    }
    // Coerce all *_cm fields to numbers (avoid string numbers)
    Object.keys(cmForm).forEach(k => {
      if (k.endsWith('_cm') && typeof cmForm[k] === 'string') {
        cmForm[k] = Number(cmForm[k]);
      }
    });
    try {
      const res = await fetch('/avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...cmForm, user_id: user.id, mesh_url: meshUrl })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        setDebugInfo({
          status: res.status,
          statusText: res.statusText,
          backend: text,
          sent: { ...cmForm, user_id: user.id, mesh_url: meshUrl },
          jsonParseError: jsonErr.message
        });
        throw new Error('Server did not return valid JSON. See debug info below.');
      }
      if (!res.ok || data.error) {
        setDebugInfo({
          status: res.status,
          statusText: res.statusText,
          backend: data,
          sent: { ...cmForm, user_id: user.id, mesh_url: meshUrl }
        });
        throw new Error(data.error || data.detail || 'Avatar save failed');
      }
      navigate('/garments');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMeshUrl(null);
    setPreviewing(true);
    // Always send cm to backend
    const cmForm = { ...form };
    if (unit === 'in') {
      Object.keys(cmForm).forEach(k => {
        if (k.endsWith('_cm')) cmForm[k] = toCm(cmForm[k], 'in');
      });
    }
    try {
      const res = await fetch('/generate_mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cmForm, pose: 't-pose' })
      });
      const data = await res.json();
      if (!res.ok || !data.mesh_url) throw new Error(data.error || data.detail || 'Mesh generation failed');
      setMeshUrl(data.mesh_url);
    } catch (err) {
      setError('Preview failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a function to call fitToView on MeshPreview
  const handleFitToFrame = () => {
    if (meshPreviewRef.current && meshPreviewRef.current.fitToView) {
      meshPreviewRef.current.fitToView();
    }
  };

  return (
    <div style={{maxWidth:1100,margin:'40px auto',padding:32,background:'#fff',borderRadius:12,boxShadow:'0 2px 16px #0002',display:'flex',gap:40,alignItems:'flex-start'}}>
      {/* Left: Form */}
      <div style={{flex:'1 1 400px',minWidth:340}}>
        <h2 style={{textAlign:'center',marginBottom:24}}>Define Your Avatar</h2>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <button type="button" onClick={() => handlePreset('male')} style={{marginRight:8}}>Average Male</button>
            <button type="button" onClick={() => handlePreset('female')}>Average Female</button>
          </div>
          <div>
            <label style={{marginRight:8}}>Units:</label>
            <select value={unit} onChange={handleUnitChange}>
              <option value="cm">cm</option>
              <option value="in">inches</option>
            </select>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexWrap:'wrap',gap:12}}>
          <label style={{flex:'1 1 45%'}}>
            Gender
            <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} required style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Height ({unit})
            <input name="height_cm" placeholder="Height" value={form.height_cm} onChange={handleChange} required style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Chest ({unit})
            <input name="chest_cm" placeholder="Chest" value={form.chest_cm} onChange={handleChange} required style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Waist ({unit})
            <input name="waist_cm" placeholder="Waist" value={form.waist_cm} onChange={handleChange} required style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Hips ({unit})
            <input name="hips_cm" placeholder="Hips" value={form.hips_cm} onChange={handleChange} required style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Neck ({unit})
            <input name="neck_cm" placeholder="Neck" value={form.neck_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Inseam ({unit})
            <input name="inseam_cm" placeholder="Inseam" value={form.inseam_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Arm Length ({unit})
            <input name="arm_length_cm" placeholder="Arm Length" value={form.arm_length_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Leg Length ({unit})
            <input name="leg_length_cm" placeholder="Leg Length" value={form.leg_length_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Shoulder ({unit})
            <input name="shoulder_cm" placeholder="Shoulder" value={form.shoulder_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Thigh ({unit})
            <input name="thigh_cm" placeholder="Thigh" value={form.thigh_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Bicep ({unit})
            <input name="bicep_cm" placeholder="Bicep" value={form.bicep_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Forearm ({unit})
            <input name="forearm_cm" placeholder="Forearm" value={form.forearm_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <label style={{flex:'1 1 45%'}}>
            Calf ({unit})
            <input name="calf_cm" placeholder="Calf" value={form.calf_cm} onChange={handleChange} style={{width:'100%'}} />
          </label>
          <div style={{display:'flex',gap:8,marginTop:24,width:'100%'}}>
            <button type="button" onClick={handlePreview} disabled={loading} style={{flex:1,padding:12,fontWeight:600,background:'#888',color:'#fff',border:'none',borderRadius:4,fontSize:16}}>
              {loading && previewing ? 'Generating Preview...' : 'Preview Avatar'}
            </button>
            <button type="button" onClick={handleFitToFrame} disabled={!meshUrl} style={{flex:1,padding:12,fontWeight:600,background:!meshUrl ? '#ccc' : '#222',color:'#fff',border:'none',borderRadius:4,fontSize:16}}>
              Fit to Frame
            </button>
          </div>
          <button type="submit" disabled={loading || !meshUrl} style={{marginTop:12,width:'100%',padding:12,fontWeight:600,background:!meshUrl ? '#ccc' : '#1976d2',color:'#fff',border:'none',borderRadius:4,fontSize:16}}>
            {loading && !previewing ? 'Saving...' : 'Save Avatar & Continue'}
          </button>
        </form>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
        {debugInfo && (
          <pre style={{background:'#f8f8f8',color:'#333',padding:12,marginTop:8,borderRadius:4,fontSize:13,overflowX:'auto'}}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
      {/* Right: Preview */}
      <div style={{flex:'1 1 600px',minWidth:400}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <h3 style={{textAlign:'center',margin:0}}>Avatar Preview</h3>
          <span style={{flex:1}} />
        </div>
        <div style={{background:'#f6f8fa',borderRadius:8,padding:8,boxShadow:'0 1px 6px #0001',position:'relative'}}>
          <MeshPreview ref={meshPreviewRef} meshUrl={meshUrl} />
        </div>
        <div style={{textAlign:'center',marginTop:8,color:'#888',fontSize:13}}>
          Scroll to zoom. Click 'Fit to Frame' to reset view.
        </div>
      </div>
    </div>
  );
}
