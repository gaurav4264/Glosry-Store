import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import SpinWheel from './SpinWheel';


const BADGE_STYLES = {
    rookie:   { grad: 'linear-gradient(135deg,#4b5563,#9ca3af)', glow: 'rgba(107,114,128,0.5)',  ring: '#9ca3af' },
    bronze:   { grad: 'linear-gradient(135deg,#78350f,#f59e0b)', glow: 'rgba(245,158,11,0.55)',  ring: '#f59e0b' },
    silver:   { grad: 'linear-gradient(135deg,#475569,#e2e8f0)', glow: 'rgba(148,163,184,0.55)', ring: '#e2e8f0' },
    gold:     { grad: 'linear-gradient(135deg,#92400e,#fde68a)', glow: 'rgba(253,230,138,0.65)', ring: '#fde68a' },
    platinum: { grad: 'linear-gradient(135deg,#0c4a6e,#7dd3fc)', glow: 'rgba(125,211,252,0.6)',  ring: '#7dd3fc' },
};

const TIER_LABELS = {
    'Bronze': { next: 'Silver', nextAt: 5000 },
    'Silver': { next: 'Gold',   nextAt: 10000 },
    'Gold':   { next: 'Platinum', nextAt: null },
};

const LoyaltyPoints = () => {
    const { user, axios, currency } = useAppContext();
    const [loyalty, setLoyalty]   = useState(null);
    const [badges, setBadges]     = useState(null);
    const [pts, setPts]           = useState(100);
    const [busy, setBusy]         = useState(false);
    const [loading, setLoading]   = useState(true);

    useEffect(() => { if (user) load(); }, [user]);

    const load = async () => {
        setLoading(true);
        try {
            const [l, b] = await Promise.all([
                axios.post('/api/loyalty/points'),
                axios.post('/api/loyalty/badges'),
            ]);
            if (l.data.success) setLoyalty(l.data);
            if (b.data.success) setBadges(b.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const redeem = async () => {
        if (!loyalty || pts > loyalty.loyaltyPoints) { toast.error('Insufficient points'); return; }
        setBusy(true);
        try {
            const { data } = await axios.post('/api/loyalty/redeem', { pointsToRedeem: pts });
            if (data.success) { toast.success(`✅ Redeemed! Got ${currency}${data.discountAmount} discount`); load(); }
            else toast.error(data.message);
        } catch (e) { toast.error(e.message); }
        finally { setBusy(false); }
    };

    /* ─── loading ─── */
    if (loading) return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:340, gap:16 }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width:44, height:44, borderRadius:'50%', border:'4px solid #e5e7eb', borderTop:'4px solid #16a34a', animation:'spin .75s linear infinite' }} />
            <p style={{ color:'#9ca3af', fontWeight:600, fontSize:15 }}>Loading your rewards…</p>
        </div>
    );

    if (!user) return (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#9ca3af' }}>
            <p style={{ fontSize:48, marginBottom:12 }}>🔒</p>
            <p style={{ fontWeight:700, fontSize:18, color:'#374151' }}>Please login to see your rewards</p>
        </div>
    );

    const cb   = badges?.currentBadge;
    const nb   = badges?.nextBadge;
    const bs   = BADGE_STYLES[cb?.id] ?? BADGE_STYLES.rookie;
    const prog = badges?.progress ?? 0;

    return (
        <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 20px 80px', fontFamily:"'Inter',system-ui,sans-serif" }}>
            <style>{`
                @keyframes spin    { to{transform:rotate(360deg)} }
                @keyframes drift   { 0%,100%{transform:scale(1) rotate(-2deg)} 50%{transform:scale(1.08) rotate(2deg)} }
                @keyframes shine   { 0%{background-position:-200% center} 100%{background-position:200% center} }
                @keyframes fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                @keyframes barFill { from{width:0} to{width:var(--w)} }
                .badge-tile:hover  { transform:translateY(-4px)!important; }
            `}</style>

            {/* ── Page Title ── */}
            <div style={{ textAlign:'center', marginBottom:32, animation:'fadeUp .4s ease' }}>
                <span style={{ display:'inline-block', background:'linear-gradient(135deg,#16a34a,#15803d)', color:'#fff', fontSize:11, fontWeight:800, padding:'4px 14px', borderRadius:20, letterSpacing:1.2, marginBottom:12 }}>
                    🏆 REWARDS CENTRE
                </span>
                <h1 style={{ fontSize:32, fontWeight:900, color:'#111827', margin:'0 0 8px', lineHeight:1.15 }}>Your Shopping Achievements</h1>
                <p style={{ color:'#6b7280', fontSize:15, margin:0 }}>Complete orders to unlock badges &amp; earn loyalty points!</p>
            </div>

            {/* ── Daily Spin Wheel ── */}
            <SpinWheel />

            {/* ── Current Badge Hero ── */}
            {cb && (
                <div style={{
                    background: bs.grad, borderRadius:28, padding:'36px 28px 28px',
                    marginBottom:28, textAlign:'center', position:'relative', overflow:'hidden',
                    boxShadow:`0 24px 64px ${bs.glow}`, animation:'fadeUp .45s ease',
                }}>
                    {/* shimmer */}
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg,transparent 35%,rgba(255,255,255,.2) 50%,transparent 65%)', backgroundSize:'200% 100%', animation:'shine 3s ease-in-out infinite', pointerEvents:'none' }} />

                    <div style={{ fontSize:80, lineHeight:1, animation:'drift 3s ease-in-out infinite', display:'inline-block', marginBottom:16, filter:`drop-shadow(0 4px 16px ${bs.glow})` }}>
                        {cb.emoji}
                    </div>

                    <p style={{ color:'rgba(255,255,255,.75)', fontSize:11, fontWeight:800, letterSpacing:2.5, textTransform:'uppercase', margin:'0 0 6px' }}>Current Badge</p>
                    <h2 style={{ color:'#fff', fontSize:40, fontWeight:900, margin:'0 0 6px', textShadow:'0 2px 16px rgba(0,0,0,.35)' }}>{cb.label}</h2>
                    <p style={{ color:'rgba(255,255,255,.7)', fontSize:14, margin:'0 0 22px' }}>{cb.description}</p>

                    <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(0,0,0,.25)', borderRadius:12, padding:'10px 20px', marginBottom:22 }}>
                        <span style={{ fontSize:20 }}>📦</span>
                        <span style={{ color:'#fff', fontWeight:800, fontSize:16 }}>
                            {badges.totalOrders} order{badges.totalOrders !== 1 ? 's' : ''} completed
                        </span>
                    </div>

                    {/* Progress Bar */}
                    {nb ? (
                        <div>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                                <span style={{ color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:700 }}>{cb.emoji} {cb.label}</span>
                                <span style={{ color:'rgba(255,255,255,.8)', fontSize:13, fontWeight:700 }}>{nb.emoji} {nb.label}</span>
                            </div>
                            <div style={{ background:'rgba(0,0,0,.3)', borderRadius:99, height:14, overflow:'hidden' }}>
                                <div style={{
                                    height:'100%', borderRadius:99,
                                    width:`${prog}%`,
                                    background:'linear-gradient(90deg,rgba(255,255,255,.55),rgba(255,255,255,.95))',
                                    transition:'width 1.2s cubic-bezier(.4,0,.2,1)',
                                    boxShadow:'0 0 10px rgba(255,255,255,.7)',
                                }} />
                            </div>
                            <div style={{ marginTop:12, background:'rgba(0,0,0,.2)', borderRadius:12, padding:'8px 16px', display:'inline-block' }}>
                                <p style={{ color:'rgba(255,255,255,.95)', fontSize:14, fontWeight:800, margin:0 }}>
                                    🎯 {badges.ordersToNext} more order{badges.ordersToNext !== 1 ? 's' : ''} → unlock {nb.emoji} {nb.label}!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ background:'rgba(255,255,255,.2)', borderRadius:14, padding:'12px 24px', display:'inline-block' }}>
                            <p style={{ color:'#fff', fontWeight:900, fontSize:16, margin:0 }}>👑 Max rank achieved! You're a legend!</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── All Badges Grid ── */}
            {badges?.allTiers && (
                <div style={{ marginBottom:28, animation:'fadeUp .5s ease' }}>
                    <h3 style={{ fontSize:18, fontWeight:800, color:'#111827', margin:'0 0 16px', display:'flex', alignItems:'center', gap:8 }}>
                        🎖️ All Badge Tiers
                    </h3>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
                        {badges.allTiers.map(tier => {
                            const unlocked  = badges.totalOrders >= tier.minOrders;
                            const isCurrent = tier.id === cb?.id;
                            const ts        = BADGE_STYLES[tier.id] ?? BADGE_STYLES.rookie;
                            return (
                                <div
                                    key={tier.id}
                                    className="badge-tile"
                                    style={{
                                        borderRadius:20, padding:'18px 8px 14px', textAlign:'center',
                                        background: unlocked ? ts.grad : '#f3f4f6',
                                        border: isCurrent ? `3px solid #fff` : `2px solid ${unlocked ? ts.ring + '60' : '#e5e7eb'}`,
                                        boxShadow: isCurrent
                                            ? `0 0 0 4px ${ts.glow}, 0 12px 32px ${ts.glow}`
                                            : unlocked ? `0 6px 20px ${ts.glow}` : 'none',
                                        opacity: unlocked ? 1 : 0.5,
                                        filter: unlocked ? 'none' : 'grayscale(.8)',
                                        transition:'all .3s ease', position:'relative', cursor:'default',
                                    }}
                                >
                                    {isCurrent && (
                                        <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'#16a34a', color:'#fff', fontSize:9, fontWeight:800, padding:'3px 8px', borderRadius:99, whiteSpace:'nowrap', boxShadow:'0 2px 8px rgba(22,163,74,.4)' }}>
                                            ★ YOU
                                        </div>
                                    )}
                                    <div style={{ fontSize:36, marginBottom:8 }}>{unlocked ? tier.emoji : '🔒'}</div>
                                    <p style={{ margin:0, fontSize:12, fontWeight:800, color: unlocked ? '#fff' : '#9ca3af' }}>{tier.label}</p>
                                    <p style={{ margin:'4px 0 0', fontSize:11, color: unlocked ? 'rgba(255,255,255,.7)' : '#d1d5db', fontWeight:600 }}>
                                        {tier.minOrders === 0 ? 'Free' : `${tier.minOrders} orders`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Loyalty Points Card ── */}
            {loyalty && (
                <div style={{ background:'#fff', border:'1.5px solid #e5e7eb', borderRadius:24, padding:28, marginBottom:22, boxShadow:'0 6px 24px rgba(0,0,0,.06)', animation:'fadeUp .55s ease' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:22 }}>
                        <div>
                            <p style={{ margin:'0 0 6px', fontSize:11, color:'#9ca3af', fontWeight:800, letterSpacing:1.5, textTransform:'uppercase' }}>Loyalty Points Balance</p>
                            <h3 style={{ margin:0, fontSize:52, fontWeight:900, color:'#16a34a', lineHeight:1 }}>{loyalty.loyaltyPoints.toLocaleString()}</h3>
                            <p style={{ margin:'6px 0 0', fontSize:14, color:'#6b7280' }}>
                                = {currency}{((loyalty.loyaltyPoints / 100) * 10).toFixed(2)} in discount value
                            </p>
                        </div>
                        <span style={{ fontSize:56 }}>🎁</span>
                    </div>

                    {/* Stats row */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:22 }}>
                        {[
                            ['Membership Tier', loyalty.membershipTier, '💎'],
                            ['Total Spent',     `${currency}${(loyalty.totalSpent||0).toFixed(0)}`, '💰'],
                            ['Orders Done',     badges?.totalOrders ?? 0, '📦'],
                        ].map(([label, val, icon]) => (
                            <div key={label} style={{ background:'#f9fafb', borderRadius:16, padding:'14px 12px', textAlign:'center' }}>
                                <p style={{ margin:'0 0 4px', fontSize:22 }}>{icon}</p>
                                <p style={{ margin:'0 0 2px', fontSize:11, color:'#9ca3af', fontWeight:700, textTransform:'uppercase', letterSpacing:.5 }}>{label}</p>
                                <p style={{ margin:0, fontSize:16, fontWeight:900, color:'#111827' }}>{val}</p>
                            </div>
                        ))}
                    </div>

                    {/* Redeem section */}
                    {loyalty.loyaltyPoints >= 100 ? (
                        <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #86efac', borderRadius:18, padding:20 }}>
                            <p style={{ margin:'0 0 12px', fontWeight:800, fontSize:15, color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
                                💸 Redeem Points for Discount
                            </p>
                            <div style={{ display:'flex', gap:10 }}>
                                <input
                                    type="number" min={100} step={100} value={pts}
                                    onChange={e => setPts(Number(e.target.value))}
                                    style={{ flex:1, padding:'12px 16px', borderRadius:14, border:'1.5px solid #86efac', fontSize:15, fontWeight:700, outline:'none', background:'#fff', color:'#111827' }}
                                />
                                <button onClick={redeem} disabled={busy} style={{
                                    padding:'12px 26px', borderRadius:14, border:'none',
                                    background:'linear-gradient(135deg,#22c55e,#15803d)', color:'#fff',
                                    fontWeight:800, fontSize:15, cursor: busy ? 'not-allowed' : 'pointer',
                                    opacity: busy ? .7 : 1, transition:'all .2s',
                                    boxShadow:'0 6px 18px rgba(34,197,94,.4)',
                                }}>
                                    {busy ? '…' : 'Redeem'}
                                </button>
                            </div>
                            <p style={{ margin:'10px 0 0', fontSize:12, color:'#15803d', fontWeight:600 }}>
                                100 points = {currency}10 discount • You'd get {currency}{((pts/100)*10).toFixed(0)} off
                            </p>
                        </div>
                    ) : (
                        <div style={{ background:'#f9fafb', border:'1.5px dashed #e5e7eb', borderRadius:18, padding:18, textAlign:'center' }}>
                            <p style={{ margin:'0 0 4px', fontSize:20 }}>⏳</p>
                            <p style={{ margin:0, fontSize:14, color:'#6b7280', fontWeight:600 }}>
                                Earn {100 - loyalty.loyaltyPoints} more points to unlock redemption!
                            </p>
                            <p style={{ margin:'4px 0 0', fontSize:12, color:'#9ca3af' }}>Every {currency}10 spent = 1 point</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── How to Level Up ── */}
            <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1px solid #bbf7d0', borderRadius:22, padding:24, animation:'fadeUp .6s ease' }}>
                <p style={{ margin:'0 0 18px', fontWeight:800, fontSize:16, color:'#15803d', display:'flex', alignItems:'center', gap:8 }}>
                    ⚡ How to Level Up Fast
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {[
                        ['📦', '3 Orders', 'Unlock 🥉 Bronze badge'],
                        ['📦', '10 Orders', 'Unlock 🥈 Silver badge'],
                        ['📦', '20 Orders', 'Unlock 🥇 Gold badge'],
                        ['💳', `${currency}10 Spent`, 'Earn 1 loyalty point'],
                    ].map(([icon, title, desc]) => (
                        <div key={title} style={{ display:'flex', gap:12, alignItems:'center', background:'rgba(255,255,255,.7)', borderRadius:14, padding:'12px 14px' }}>
                            <div style={{ width:40, height:40, borderRadius:12, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,.08)' }}>{icon}</div>
                            <div>
                                <p style={{ margin:0, fontWeight:800, fontSize:13, color:'#14532d' }}>{title}</p>
                                <p style={{ margin:'2px 0 0', fontSize:12, color:'#4b7a5a' }}>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyPoints;
