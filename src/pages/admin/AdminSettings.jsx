import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RESORT_LABELS = {
    limuru: 'Jumuia Limuru Country Home',
    kanamai: 'Jumuia Kanamai Beach Resort',
    kisumu: 'Jumuia Hotel Kisumu',
};

const ROLE_LABELS = {
    'general-manager': 'General Manager',
    'manager': 'Branch Manager',
    'admin': 'Administrator',
};

export function AdminSettings() {
    const { user, updateUser } = useAuth();
    const isGM = user?.role === 'general-manager' || user?.role === 'admin';

    // ── Profile form state ──
    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileMsg, setProfileMsg] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // ── Password form state ──
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [passMsg, setPassMsg] = useState(null);
    const [passLoading, setPassLoading] = useState(false);
    const [showPw, setShowPw] = useState({ newPass: false, confirm: false, staffPw: false });
    const togglePw = key => setShowPw(s => ({ ...s, [key]: !s[key] }));


    // ── Staff list (GM only) ──
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'manager', property: 'limuru' });
    const [staffMsg, setStaffMsg] = useState(null);
    const [addingStaff, setAddingStaff] = useState(false);

    useEffect(() => { if (isGM) loadStaff(); }, []);

    const loadStaff = async () => {
        setStaffLoading(true);
        try {
            const res = await api.get('/users');
            setStaff(res.data);
        } catch { /* no-op */ }
        setStaffLoading(false);
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            const res = await api.put('/auth/profile', { name: profile.name, email: profile.email });
            if (updateUser) updateUser(res.data);
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Could not update profile.' });
        }
        setProfileLoading(false);
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setPassMsg(null);
        if (passwords.newPass.length < 6) return setPassMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
        if (passwords.newPass !== passwords.confirm) return setPassMsg({ type: 'error', text: 'Passwords do not match.' });
        setPassLoading(true);
        try {
            await api.put('/auth/profile', { password: passwords.newPass });
            setPasswords({ current: '', newPass: '', confirm: '' });
            setPassMsg({ type: 'success', text: 'Password changed successfully!' });
        } catch (err) {
            setPassMsg({ type: 'error', text: err.response?.data?.message || 'Could not change password.' });
        }
        setPassLoading(false);
    };

    const createStaff = async (e) => {
        e.preventDefault();
        setAddingStaff(true);
        setStaffMsg(null);
        try {
            await api.post('/users', { ...newStaff, properties: [newStaff.property] });
            setNewStaff({ name: '', email: '', password: '', role: 'manager', property: 'limuru' });
            setStaffMsg({ type: 'success', text: 'Account created successfully!' });
            loadStaff();
        } catch (err) {
            setStaffMsg({ type: 'error', text: err.response?.data?.message || 'Could not create account.' });
        }
        setAddingStaff(false);
    };

    const deleteStaff = async (id, name) => {
        if (!window.confirm(`Remove ${name} from the system?`)) return;
        try {
            await api.delete(`/users/${id}`);
            setStaff(prev => prev.filter(s => s._id !== id));
        } catch {
            alert('Could not delete user.');
        }
    };

    const resetStaffPassword = async (id, name) => {
        const newPw = prompt(`Enter new password for ${name} (min 6 characters):`);
        if (!newPw || newPw.length < 6) return alert('Password too short. Nothing was changed.');
        try {
            await api.put(`/users/${id}/reset-password`, { password: newPw });
            alert(`Password for ${name} has been reset.`);
        } catch {
            alert('Could not reset password.');
        }
    };

    // Msg helper
    const Msg = ({ msg }) => !msg ? null : (
        <div style={{
            padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', marginTop: '12px',
            background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: msg.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
            <i className={`fas fa-${msg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ marginRight: '8px' }}></i>
            {msg.text}
        </div>
    );

    return (
        <div className="anim-fade-in" style={{ paddingBottom: '40px' }}>

            <div className="admin-page-header" style={{ marginBottom: '28px' }}>
                <div>
                    <h1>⚙️ Settings</h1>
                    <p style={{ color: 'var(--text-light)' }}>Manage your account, security, and staff access</p>
                </div>
            </div>

            {/* ── WHO AM I banner ── */}
            <div style={{ background: 'linear-gradient(135deg, #22440f 0%, #3a7d20 100%)', borderRadius: '14px', padding: '20px 28px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: '900', flexShrink: 0 }}>
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                    <div style={{ fontWeight: '900', fontSize: '1.15rem' }}>{user?.name}</div>
                    <div style={{ opacity: 0.8, fontSize: '0.82rem', marginTop: '2px' }}>{user?.email}</div>
                    <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 12px', fontSize: '0.72rem', fontWeight: '700' }}>
                            {ROLE_LABELS[user?.role] || user?.role}
                        </span>
                        {(user?.properties || []).map(p => (
                            <span key={p} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '2px 12px', fontSize: '0.72rem' }}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

                {/* ── Profile Settings ── */}
                <div className="admin-card" style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ background: '#22440f', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-user" style={{ color: 'white', fontSize: '0.85rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>My Profile</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Update your name and email address</p>
                        </div>
                    </div>
                    <form onSubmit={saveProfile}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Full Name</label>
                            <input className="form-input" value={profile.name}
                                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                placeholder="Your full name" style={{ width: '100%' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Email Address</label>
                            <input className="form-input" type="email" value={profile.email}
                                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                                placeholder="your@email.com" style={{ width: '100%' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={profileLoading}>
                            {profileLoading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Profile</>}
                        </button>
                        <Msg msg={profileMsg} />
                    </form>
                </div>

                {/* ── Change Password ── */}
                <div className="admin-card" style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ background: '#4338ca', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-lock" style={{ color: 'white', fontSize: '0.85rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Change Password</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Keep your account secure with a strong password</p>
                        </div>
                    </div>
                    <form onSubmit={savePassword}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showPw.newPass ? 'text' : 'password'} value={passwords.newPass}
                                    onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                                    placeholder="At least 6 characters" style={{ width: '100%', paddingRight: '40px' }} />
                                <button type="button" onClick={() => togglePw('newPass')}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', padding: '4px' }}>
                                    <i className={`fas fa-${showPw.newPass ? 'eye-slash' : 'eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: '#374151' }}>Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="form-input" type={showPw.confirm ? 'text' : 'password'} value={passwords.confirm}
                                    onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                    placeholder="Repeat new password" style={{ width: '100%', paddingRight: '40px' }} />
                                <button type="button" onClick={() => togglePw('confirm')}
                                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', padding: '4px' }}>
                                    <i className={`fas fa-${showPw.confirm ? 'eye-slash' : 'eye'}`}></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#4338ca' }} disabled={passLoading}>
                            {passLoading ? <><i className="fas fa-spinner fa-spin"></i> Updating...</> : <><i className="fas fa-key"></i> Change Password</>}
                        </button>
                        <Msg msg={passMsg} />
                    </form>
                </div>
            </div>

            {/* ── System Info ── */}
            <div className="admin-card" style={{ padding: '26px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: '#f97316', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-info-circle" style={{ color: 'white', fontSize: '0.85rem' }}></i>
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>System Information</h3>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Details about this management system</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: 'hotel', color: '#22440f', label: 'System Name', val: 'Jumuia Resorts Management' },
                        { icon: 'code-branch', color: '#4338ca', label: 'Version', val: 'v2.0.0 — Production' },
                        { icon: 'calendar-alt', color: '#f97316', label: 'Last Updated', val: new Date().toLocaleDateString('en-KE', { dateStyle: 'long' }) },
                        { icon: 'globe', color: '#0ea5e9', label: 'Properties', val: 'Limuru · Kanamai · Kisumu' },
                        { icon: 'envelope', color: '#9c27b0', label: 'Support', val: 'support@jumuiaresorts.org' },
                        { icon: 'shield-alt', color: '#16a34a', label: 'Security', val: 'JWT Auth · Role-based Access' },
                    ].map(row => (
                        <div key={row.label} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                            <div style={{ background: row.color, borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas fa-${row.icon}`} style={{ color: 'white', fontSize: '0.8rem' }}></i>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '2px' }}>{row.label}</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#1e293b' }}>{row.val}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Staff / Account Management (GM only) ── */}
            {isGM && (
                <div className="admin-card" style={{ padding: '26px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ background: '#16a34a', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-users-cog" style={{ color: 'white', fontSize: '0.85rem' }}></i>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>Staff Account Management</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>Create and manage branch manager accounts — visible to General Managers only</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>

                        {/* Create new staff */}
                        <div>
                            <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#374151' }}>➕ Add New Account</h4>
                            <form onSubmit={createStaff}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px' }}>Full Name</label>
                                    <input className="form-input" value={newStaff.name}
                                        onChange={e => setNewStaff(s => ({ ...s, name: e.target.value }))}
                                        placeholder="e.g. Jane Wanjiru" required style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px' }}>Email Address</label>
                                    <input className="form-input" type="email" value={newStaff.email}
                                        onChange={e => setNewStaff(s => ({ ...s, email: e.target.value }))}
                                        placeholder="jane@jumuia.org" required style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px' }}>Temporary Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input className="form-input" type={showPw.staffPw ? 'text' : 'password'} value={newStaff.password}
                                            onChange={e => setNewStaff(s => ({ ...s, password: e.target.value }))}
                                            placeholder="Min 6 characters" required style={{ width: '100%', paddingRight: '40px' }} />
                                        <button type="button" onClick={() => togglePw('staffPw')}
                                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.9rem', padding: '4px' }}>
                                            <i className={`fas fa-${showPw.staffPw ? 'eye-slash' : 'eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px' }}>Role</label>
                                        <select className="form-input" value={newStaff.role}
                                            onChange={e => setNewStaff(s => ({ ...s, role: e.target.value }))} style={{ width: '100%' }}>
                                            <option value="manager">Branch Manager</option>
                                            <option value="general-manager">General Manager</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', marginBottom: '5px' }}>Assigned Resort</label>
                                        <select className="form-input" value={newStaff.property}
                                            onChange={e => setNewStaff(s => ({ ...s, property: e.target.value }))} style={{ width: '100%' }}>
                                            <option value="limuru">Limuru</option>
                                            <option value="kanamai">Kanamai</option>
                                            <option value="kisumu">Kisumu</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#16a34a' }} disabled={addingStaff}>
                                    {addingStaff ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : <><i className="fas fa-user-plus"></i> Create Account</>}
                                </button>
                                <Msg msg={staffMsg} />
                            </form>
                        </div>

                        {/* Staff list */}
                        <div>
                            <h4 style={{ margin: '0 0 14px', fontSize: '0.9rem', color: '#374151' }}>👥 Existing Accounts</h4>
                            {staffLoading ? (
                                <div style={{ textAlign: 'center', padding: '30px' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
                            ) : (
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Name</th><th>Role</th><th>Resort</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {staff.length === 0 ? (
                                                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No accounts found</td></tr>
                                            ) : staff.map(s => (
                                                <tr key={s._id}>
                                                    <td>
                                                        <div style={{ fontWeight: '700' }}>{s.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#888' }}>{s.email}</div>
                                                    </td>
                                                    <td>
                                                        <span style={{ background: s.role === 'general-manager' ? '#22440f' : '#4338ca', color: 'white', borderRadius: '20px', padding: '2px 10px', fontSize: '0.7rem', fontWeight: '700' }}>
                                                            {s.role === 'general-manager' ? 'GM' : 'Manager'}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.8rem' }}>
                                                        {(s.properties || []).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ') || '—'}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px' }}>
                                                            <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                                                onClick={() => resetStaffPassword(s._id, s.name)} title="Reset password">
                                                                <i className="fas fa-key"></i>
                                                            </button>
                                                            {s._id !== user?._id && (
                                                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                                                                    onClick={() => deleteStaff(s._id, s.name)} title="Remove account">
                                                                    <i className="fas fa-trash"></i>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
