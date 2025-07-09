import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GarmentsPage({ user, token }) {
  const [garments, setGarments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGarments() {
      try {
        const res = await fetch('/garments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to load garments');
        setGarments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGarments();
  }, [token]);

  const handleTryOn = async () => {
    if (!selected) return setError('Please select a garment.');
    setError(null);
    try {
      const res = await fetch('/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, garment_id: selected })
      });
      const data = await res.json();
      if (!res.ok || !data.task_id) throw new Error(data.detail || 'Try-on failed');
      navigate(`/tryon/result/${data.task_id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{textAlign:'center',marginTop:40}}>Loading garments...</div>;
  if (error) return <div style={{color:'red',textAlign:'center',marginTop:40}}>{error}</div>;

  return (
    <div style={{maxWidth:600,margin:'40px auto',padding:32,background:'#fff',borderRadius:8,boxShadow:'0 2px 12px #0002'}}>
      <h2 style={{textAlign:'center',marginBottom:24}}>Select a Garment</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:16,justifyContent:'center'}}>
        {garments.map(g => (
          <div key={g.id} onClick={()=>setSelected(g.id)}
            style={{border:selected===g.id?'2px solid #1976d2':'1px solid #ccc',borderRadius:8,padding:12,cursor:'pointer',background:selected===g.id?'#e3f2fd':'#fafafa',minWidth:120,textAlign:'center'}}>
            <img src={g.image_url} alt={g.name} style={{width:80,height:80,objectFit:'cover',borderRadius:6,marginBottom:8}}/>
            <div style={{fontWeight:600}}>{g.name}</div>
            <div style={{fontSize:13,color:'#555'}}>{g.category}</div>
          </div>
        ))}
      </div>
      <button onClick={handleTryOn} style={{marginTop:32,width:'100%',padding:12,fontWeight:600,background:'#1976d2',color:'#fff',border:'none',borderRadius:4,fontSize:16}}>Try On</button>
    </div>
  );
}
