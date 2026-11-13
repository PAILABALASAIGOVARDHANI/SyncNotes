import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [user, setUser] = useState(() => localStorage.getItem('syncUser'));
  const [isReg, setIsReg] = useState(false);
  const [uname, setUname] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [cpwd, setCpwd] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [notes, setNotes] = useState([]);
  const [act, setAct] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cat, setCat] = useState('General');
  const [pin, setPin] = useState(false);
  const [msg, setMsg] = useState('');
  const [flt, setFlt] = useState('All');
  const [dark, setDark] = useState(false);

  const cols = { General: '#6b7280', Study: '#2563eb', Work: '#d97706', Personal: '#059669' };
  const api = 'http://localhost:5000/api';

  useEffect(() => {
    if (!user) return;
    fetch(api + '/notes/' + user).then(r => r.json()).then(d => { setNotes(d); d.length ? open(d[0]) : setAct(null); });
  }, [user]);

  const auth = (e) => {
    e.preventDefault(); setErr('');
    if (isReg && pwd.length < 6) return setErr('Password must be 6+ chars.');
    if (isReg && pwd !== cpwd) return setErr('Passwords do not match.');
    fetch(api + (isReg ? '/register' : '/login'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname, email, password: pwd }),
    }).then(r => r.json()).then(d => {
      if (d.error) setErr(d.error);
      else { localStorage.setItem('syncUser', d.username); setUser(d.username); setUname(''); setEmail(''); setPwd(''); setCpwd(''); }
    });
  };

  const open = (n) => { setAct(n); setTitle(n.title); setContent(n.content); setCat(n.category || 'General'); setPin(n.isPinned || false); setMsg(''); };
  const add = () => {
    const b = { id: Date.now().toString(), title: '', content: '', category: 'General', isPinned: false, owner: user };
    setAct(b); setTitle(''); setContent(''); setCat('General'); setPin(false); setNotes([b, ...notes]); setFlt('All');
  };

  const save = (p = pin) => {
    if (!act) return;
    const upd = { id: act.id, title: title || 'Untitled Note', content, category: cat, isPinned: p, owner: user };
    fetch(api + '/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(upd) })
      .then(() => { setNotes(notes.map(n => n.id === act.id ? upd : n)); setAct(upd); setTitle(upd.title); setMsg('Saved!'); setTimeout(() => setMsg(''), 2000); });
  };

  const dl = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([title + '\n\n' + content], { type: 'text/plain' }));
    a.download = (title || 'note') + '.txt'; a.click();
  };

  const del = (id) => {
    fetch(api + '/notes/' + id, { method: 'DELETE' }).then(() => {
      const left = notes.filter(n => n.id !== id); setNotes(left); left.length ? open(left[0]) : setAct(null);
    });
  };

  if (!user) {
    return (
      <div className="auth-bg">
        <form onSubmit={auth} className="auth-card">
          <div style={{ textAlign: 'center' }}><b style={{ fontSize: 12, color: '#4f46e5' }}>SYNCNOTES</b><h2>{isReg ? 'Create Account' : 'Welcome Back'}</h2></div>
          {err && <div className="err">{err}</div>}
          <input placeholder="Username" value={uname} onChange={e => setUname(e.target.value)} required />
          {isReg && <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />}
          <div className="pwd-wrap">
            <input type={show ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={pwd} onChange={e => setPwd(e.target.value)} required />
            <button type="button" onClick={() => setShow(!show)} className="pwd-btn">{show ? 'Hide' : 'Show'}</button>
          </div>
          {isReg && <input type={show ? 'text' : 'password'} placeholder="Confirm Password" value={cpwd} onChange={e => setCpwd(e.target.value)} required />}
          <button type="submit" className="btn" style={{ background: '#4f46e5', padding: 12 }}>{isReg ? 'Create Account' : 'Sign In'}</button>
          <button type="button" onClick={() => { setIsReg(!isReg); setErr(''); }} className="link">{isReg ? 'Already have an account? Sign In' : 'Need an account? Register'}</button>
        </form>
      </div>
    );
  }

  const list = notes.filter(n => flt === 'All' || (n.category || 'General') === flt).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <div className="side">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b>User: {user}</b>
          <button onClick={() => { localStorage.removeItem('syncUser'); setUser(null); }} className="btn" style={{ background: '#dc2626', padding: '4px 10px' }}>Logout</button>
        </div>
        <div className="row">
          <button onClick={add} className="btn" style={{ background: '#4f46e5', flex: 1 }}>New Note</button>
          <button onClick={() => setDark(!dark)} className="btn" style={{ background: dark ? '#fbbf24' : '#1f2937', color: dark ? '#111' : '#fff' }}>{dark ? 'Light' : 'Dark'}</button>
        </div>
        <div className="row">
          {['All', 'General', 'Study', 'Work', 'Personal'].map(c => (
            <button key={c} onClick={() => setFlt(c)} className="badge" style={{ background: flt === c ? '#4f46e5' : '#6b7280' }}>{c}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {list.map(n => (
            <div key={n.id} onClick={() => open(n)} className={act?.id === n.id ? 'card act' : 'card'}>
              <div style={{ marginBottom: 6 }}><b>{n.isPinned ? '[Pinned] ' : ''}{n.title || 'Untitled Note'}</b></div>
              <span className="badge" style={{ background: cols[n.category || 'General'] }}>{n.category || 'General'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="main">
        {act ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 15 }}>
            <div className="row">
              <input className="tin" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
              <select value={cat} onChange={e => setCat(e.target.value)} style={{ padding: 9, borderRadius: 5 }}><option>General</option><option>Study</option><option>Work</option><option>Personal</option></select>
              {msg && <b style={{ color: '#10b981' }}>{msg}</b>}
              <button onClick={() => { setPin(!pin); save(!pin); }} className="btn" style={{ background: pin ? '#f59e0b' : '#e5e7eb', color: pin ? '#fff' : '#333' }}>{pin ? 'Pinned' : 'Pin'}</button>
              <button onClick={dl} className="btn" style={{ background: '#0284c7' }}>Download</button>
              <button onClick={() => save()} className="btn" style={{ background: '#16a34a' }}>Save</button>
              <button onClick={() => del(act.id)} className="btn" style={{ background: '#dc2626' }}>Delete</button>
            </div>
            <textarea className="tarea" value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note..." />
          </div>
        ) : <div style={{ margin: 'auto', color: '#888' }}>Click New Note on the left to start.</div>}
      </div>
    </div>
  );
}
