import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

// Wheel segments – all award 2 spin points but look varied
const SEGMENTS = [
    { label: '+2 🎯', color: '#16a34a' },
    { label: '2 pts ⭐', color: '#2563eb' },
    { label: '2 pts 🔥', color: '#dc2626' },
    { label: '+2 🍀', color: '#9333ea' },
    { label: '2 pts 🎁', color: '#ea580c' },
    { label: '+2 💎', color: '#0891b2' },
    { label: '2 pts ✨', color: '#d97706' },
    { label: '+2 🌟', color: '#be185d' },
];

const RADIUS = 140;
const CENTER = 150;
const SEG_ANGLE = (2 * Math.PI) / SEGMENTS.length;

function drawWheel(ctx, rotation) {
    SEGMENTS.forEach((seg, i) => {
        const start = rotation + i * SEG_ANGLE;
        const end   = start + SEG_ANGLE;

        // Slice
        ctx.beginPath();
        ctx.moveTo(CENTER, CENTER);
        ctx.arc(CENTER, CENTER, RADIUS, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.translate(CENTER, CENTER);
        ctx.rotate(start + SEG_ANGLE / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Inter,system-ui,sans-serif';
        ctx.fillText(seg.label, RADIUS - 12, 5);
        ctx.restore();
    });

    // Center hub
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub emoji
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎰', CENTER, CENTER);
}

const SpinWheel = () => {
    const { user, axios } = useAppContext();

    const canvasRef  = useRef(null);
    const rafRef     = useRef(null);
    const rotRef     = useRef(0);

    const [spinning,    setSpinning]    = useState(false);
    const [alreadySpun, setAlreadySpun] = useState(false);
    const [countdown,   setCountdown]   = useState('');
    const [spinPoints,  setSpinPoints]  = useState(0);
    const [loading,     setLoading]     = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    /* ── fetch spin status on mount ── */
    useEffect(() => {
        if (!user) return;
        const fetchStatus = async () => {
            try {
                const { data } = await axios.post('/api/loyalty/spin-status');
                if (data.success) {
                    setSpinPoints(data.spinPoints || 0);
                    if (data.alreadySpun) {
                        setAlreadySpun(true);
                        startCountdown(data.hoursLeft, data.minsLeft);
                    }
                }
            } catch (_) {}
            setLoading(false);
        };
        fetchStatus();
    }, [user]);

    /* ── initial canvas draw ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        drawWheel(ctx, rotRef.current);
    }, [loading]);

    const startCountdown = (h, m) => {
        setCountdown(`${h}h ${m}m`);
    };

    /* ── spinning animation ── */
    const handleSpin = async () => {
        if (spinning || alreadySpun) return;
        setSpinning(true);

        // Pick a random final angle (5–8 full rotations + random landing)
        const spins     = 5 + Math.random() * 3;
        const extraAngle = Math.random() * 2 * Math.PI;
        const totalAngle = spins * 2 * Math.PI + extraAngle;
        const duration   = 4000; // ms
        const startRot   = rotRef.current;
        const startTime  = performance.now();

        const ease = (t) => 1 - Math.pow(1 - t, 4); // ease-out quart

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            rotRef.current = startRot + totalAngle * ease(progress);

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, 300, 300);
                drawWheel(ctx, rotRef.current);
            }

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            } else {
                setSpinning(false);
                submitSpin();
            }
        };

        rafRef.current = requestAnimationFrame(animate);
    };

    const submitSpin = async () => {
        try {
            const { data } = await axios.post('/api/loyalty/spin');
            if (data.success) {
                setSpinPoints(data.totalSpinPoints);
                setAlreadySpun(true);
                setShowConfetti(true);
                toast.success('🎉 +2 Spin Points earned!', { duration: 3000 });
                setTimeout(() => setShowConfetti(false), 3000);
            } else if (data.alreadySpun) {
                setAlreadySpun(true);
                startCountdown(data.hoursLeft, data.minsLeft);
                toast.error(data.message);
            }
        } catch (e) {
            toast.error('Spin failed, try again');
            setSpinning(false);
        }
    };

    /* ── cleanup ── */
    useEffect(() => () => rafRef.current && cancelAnimationFrame(rafRef.current), []);

    const progress200 = Math.min(100, Math.round((spinPoints / 200) * 100));

    if (!user || loading) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)',
            borderRadius: 28,
            padding: '32px 24px 28px',
            marginBottom: 28,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(79,70,229,0.45)',
            animation: 'fadeUp .4s ease',
        }}>
            {/* Background glow orbs */}
            <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(139,92,246,.25)', top:-60, right:-60, pointerEvents:'none' }} />
            <div style={{ position:'absolute', width:150, height:150, borderRadius:'50%', background:'rgba(59,130,246,.2)', bottom:-40, left:-40, pointerEvents:'none' }} />

            {/* Confetti particles */}
            {showConfetti && (
                <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
                    {[...Array(18)].map((_, i) => (
                        <div key={i} style={{
                            position:'absolute',
                            width: 8 + Math.random()*6,
                            height: 8 + Math.random()*6,
                            borderRadius: Math.random() > 0.5 ? '50%' : 2,
                            background: ['#fbbf24','#34d399','#60a5fa','#f87171','#a78bfa','#fb923c'][i%6],
                            left: `${5 + (i * 5.5) % 90}%`,
                            top: '10%',
                            animation: `confettiFall ${1.5 + Math.random()}s ease-out forwards`,
                            animationDelay: `${Math.random() * 0.5}s`,
                        }} />
                    ))}
                </div>
            )}

            <style>{`
                @keyframes confettiFall {
                    0%   { transform: translateY(0) rotate(0deg); opacity:1 }
                    100% { transform: translateY(220px) rotate(360deg); opacity:0 }
                }
                @keyframes pulse-spin-btn {
                    0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.5) }
                    50%     { box-shadow: 0 0 0 12px rgba(250,204,21,0) }
                }
            `}</style>

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:20 }}>
                <span style={{ display:'inline-block', background:'rgba(255,255,255,.15)', color:'#fde68a', fontSize:11, fontWeight:800, padding:'4px 14px', borderRadius:20, letterSpacing:1.5, marginBottom:10 }}>
                    🎰 DAILY SPIN WHEEL
                </span>
                <h2 style={{ margin:0, color:'#fff', fontSize:22, fontWeight:900 }}>Spin & Win Points!</h2>
                <p style={{ margin:'6px 0 0', color:'rgba(255,255,255,.65)', fontSize:13 }}>
                    1 free spin every day · Earn <strong style={{color:'#fde68a'}}>+2 points</strong> each spin
                </p>
            </div>

            {/* Wheel + Pointer row */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>
                {/* Pointer */}
                <div style={{
                    width:0, height:0,
                    borderLeft:'12px solid transparent',
                    borderRight:'12px solid transparent',
                    borderTop:'24px solid #fbbf24',
                    filter:'drop-shadow(0 2px 6px rgba(251,191,36,.7))',
                    zIndex:2, marginBottom:-2,
                }} />

                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    style={{ borderRadius:'50%', boxShadow:'0 8px 40px rgba(0,0,0,.45)', maxWidth:280 }}
                />
            </div>

            {/* Spin Button */}
            <div style={{ textAlign:'center', marginTop:20 }}>
                {!alreadySpun ? (
                    <button
                        onClick={handleSpin}
                        disabled={spinning}
                        style={{
                            background: spinning ? '#6b7280' : 'linear-gradient(135deg,#fbbf24,#f59e0b)',
                            color: '#1c1917',
                            border:'none',
                            borderRadius:99,
                            padding:'14px 42px',
                            fontSize:17,
                            fontWeight:900,
                            cursor: spinning ? 'not-allowed' : 'pointer',
                            animation: spinning ? 'none' : 'pulse-spin-btn 2s infinite',
                            transition:'all .2s',
                            letterSpacing:.5,
                        }}
                    >
                        {spinning ? '⏳ Spinning…' : '🎯 SPIN NOW'}
                    </button>
                ) : (
                    <div style={{ background:'rgba(255,255,255,.12)', borderRadius:16, padding:'12px 24px', display:'inline-block' }}>
                        <p style={{ margin:0, color:'#86efac', fontWeight:800, fontSize:15 }}>✅ Spun Today!</p>
                        {countdown && (
                            <p style={{ margin:'4px 0 0', color:'rgba(255,255,255,.7)', fontSize:13 }}>
                                🕐 Next spin in <strong style={{color:'#fde68a'}}>{countdown}</strong>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Spin Points Balance */}
            <div style={{ marginTop:22, background:'rgba(255,255,255,.1)', borderRadius:20, padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <div>
                        <p style={{ margin:0, color:'rgba(255,255,255,.65)', fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase' }}>Spin Points Balance</p>
                        <p style={{ margin:'4px 0 0', color:'#fde68a', fontSize:32, fontWeight:900, lineHeight:1 }}>
                            {spinPoints} <span style={{ fontSize:14, color:'rgba(255,255,255,.5)', fontWeight:600 }}>/ 200</span>
                        </p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <p style={{ margin:0, color:'rgba(255,255,255,.65)', fontSize:12, fontWeight:600 }}>Worth</p>
                        <p style={{ margin:'4px 0 0', color:'#86efac', fontSize:20, fontWeight:900 }}>₹40 off</p>
                        <p style={{ margin:0, color:'rgba(255,255,255,.4)', fontSize:11 }}>at 200 pts</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ background:'rgba(0,0,0,.3)', borderRadius:99, height:10, overflow:'hidden' }}>
                    <div style={{
                        height:'100%', borderRadius:99,
                        width:`${progress200}%`,
                        background:'linear-gradient(90deg,#6ee7b7,#fde68a)',
                        transition:'width 1s ease',
                        boxShadow:'0 0 8px rgba(253,230,138,.6)',
                    }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                    <span style={{ color:'rgba(255,255,255,.5)', fontSize:11 }}>{progress200}% complete</span>
                    <span style={{ color:'rgba(255,255,255,.5)', fontSize:11 }}>{Math.max(0,200 - spinPoints)} more pts needed</span>
                </div>

                {spinPoints >= 200 && (
                    <div style={{ marginTop:12, background:'rgba(134,239,172,.15)', border:'1px solid rgba(134,239,172,.4)', borderRadius:12, padding:'10px 14px', textAlign:'center' }}>
                        <p style={{ margin:0, color:'#86efac', fontWeight:800, fontSize:14 }}>
                            🎁 You can redeem ₹40 off at checkout!
                        </p>
                    </div>
                )}
            </div>

            {/* How it works */}
            <div style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                {[
                    ['🎰', 'Spin Daily', '1 free spin/day'],
                    ['⭐', '+2 Points', 'Every spin wins'],
                    ['🛒', '200pts = ₹40', 'Use at checkout'],
                ].map(([icon, title, desc]) => (
                    <div key={title} style={{ background:'rgba(255,255,255,.08)', borderRadius:14, padding:'12px 8px', textAlign:'center' }}>
                        <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                        <p style={{ margin:0, color:'#fff', fontSize:12, fontWeight:800 }}>{title}</p>
                        <p style={{ margin:'3px 0 0', color:'rgba(255,255,255,.5)', fontSize:11 }}>{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpinWheel;
