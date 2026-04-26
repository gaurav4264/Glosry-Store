import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const BarcodeScan = () => {
  const { axios, addToCart, currency, user, setShowUserLogin } = useAppContext();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [notFoundCode, setNotFoundCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('scan');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const uploadInputRef = useRef(null);

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const lastCodeRef = useRef('');

  // Load available cameras on mount
  useEffect(() => {
    BrowserMultiFormatReader.listVideoInputDevices()
      .then(devices => {
        setCameras(devices);
        // Prefer back/environment camera on mobile
        const back = devices.find(d =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        if (back) setSelectedCamera(back.deviceId);
        else if (devices.length > 0) setSelectedCamera(devices[devices.length - 1].deviceId);
      })
      .catch(() => {
        setCameras([]);
      });
  }, []);

  const lookupProduct = useCallback(async (code) => {
    if (!code || code === lastCodeRef.current) return;
    lastCodeRef.current = code;
    setScannedCode(code);
    setFoundProduct(null);
    setNotFoundCode(null);
    setAddedToCart(false);
    setLoading(true);
    if (navigator.vibrate) navigator.vibrate(100);

    try {
      const { data } = await axios.get(`/api/scan/barcode?code=${encodeURIComponent(code)}`);
      if (data.success && data.product) {
        setFoundProduct(data.product);
        setNotFoundCode(null);
        setScanHistory(prev => {
          if (prev.find(h => h.code === code)) return prev;
          return [{ code, product: data.product, time: new Date() }, ...prev].slice(0, 10);
        });
        toast.success(`Found: ${data.product.name}`, { icon: '📦' });
      } else {
        setFoundProduct(null);
        // Store both barcode and externalName (if Open Food Facts identified it)
        setNotFoundCode({ code, externalName: data.externalName || null, message: data.message });
        setScanHistory(prev => {
          if (prev.find(h => h.code === code)) return prev;
          return [{ code, product: null, time: new Date() }, ...prev].slice(0, 10);
        });
        toast.error(data.externalName ? `"${data.externalName}" not in store` : 'Product not found in store');
      }
    } catch {
      toast.error('Error looking up product');
    } finally {
      setLoading(false);
      setTimeout(() => { lastCodeRef.current = ''; }, 2500);
    }
  }, [axios]);


  const startScanning = useCallback(async () => {
    setCameraError(null);
    setFoundProduct(null);
    setNotFoundCode(null);
    setScannedCode('');
    setAddedToCart(false);
    lastCodeRef.current = '';

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const constraints = selectedCamera
        ? { deviceId: { exact: selectedCamera } }
        : { facingMode: { ideal: 'environment' } };

      const controls = await reader.decodeFromConstraints(
        { video: constraints },
        videoRef.current,
        (result, err) => {
          if (result) {
            lookupProduct(result.getText());
          }
          // Errors during scanning are normal (no barcode in frame) — ignore them
        }
      );

      controlsRef.current = controls;
      setScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('❌ Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('❌ No camera found on this device. Use manual entry below.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('❌ Camera is busy or unavailable. Close other apps using the camera.');
      } else {
        setCameraError('❌ Camera error: ' + (err.message || err.name));
      }
    }
  }, [selectedCamera, lookupProduct]);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch (_) {}
      controlsRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    return () => { stopScanning(); };
  }, [stopScanning]);

  const handleAddToCart = () => {
    if (!user) { setShowUserLogin(true); return; }
    if (foundProduct) {
      addToCart(foundProduct._id);
      setAddedToCart(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setUploadPreview(objectUrl);
    setImageUploading(true);
    setFoundProduct(null);
    setScannedCode('');
    setAddedToCart(false);
    lastCodeRef.current = '';
    try {
      const reader = new BrowserMultiFormatReader();
      const result = await reader.decodeFromImageUrl(objectUrl);
      if (result) {
        await lookupProduct(result.getText());
      } else {
        toast.error('No barcode found in image');
      }
    } catch {
      toast.error('Could not read barcode from image. Try a clearer photo.');
    } finally {
      setImageUploading(false);
      // allow re-uploading same file
      e.target.value = '';
    }
  };

  const handleManualLookup = async (e) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    setManualCode('');
    lastCodeRef.current = '';
    await lookupProduct(code);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 60px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @keyframes laserMove { 0%,100%{top:28%} 50%{top:72%} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.75)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes codeFade { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .bc-btn:active{transform:scale(.97)!important}
        .bc-input:focus{border-color:#22c55e!important;outline:none}
        .bc-hist:hover{background:#f9fafb}
      `}</style>

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 76, height: 76, borderRadius: 22, margin: '0 auto 16px',
          background: 'linear-gradient(135deg,#22c55e,#15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(34,197,94,.4)'
        }}>
          <span style={{ fontSize: 36 }}>📦</span>
        </div>
        <span style={{
          display: 'inline-block', background: 'linear-gradient(135deg,#22c55e,#15803d)',
          color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 20, marginBottom: 10, letterSpacing: 1
        }}>SCAN & SHOP</span>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Barcode Scanner</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Scan any product barcode at home →<br />add it to your online cart instantly 🛒
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 14, padding: 4, marginBottom: 22 }}>
        {[['scan', '📷 Scanner'], ['history', `🕓 History (${scanHistory.length})`]].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '10px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, transition: 'all .2s',
            background: activeTab === tab ? '#fff' : 'transparent',
            color: activeTab === tab ? '#15803d' : '#9ca3af',
            boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,.1)' : 'none'
          }}>{label}</button>
        ))}
      </div>

      {/* ══════ SCAN TAB ══════ */}
      {activeTab === 'scan' && (<>

        {/* Camera selector (if multiple cameras) */}
        {cameras.length > 1 && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
              📷 Select Camera
            </label>
            <select
              value={selectedCamera}
              onChange={e => { setSelectedCamera(e.target.value); if (scanning) { stopScanning(); } }}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1.5px solid #d1d5db', background: '#fff', fontSize: 13, color: '#111827'
              }}
            >
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>{cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Viewfinder ── */}
        <div style={{
          position: 'relative', borderRadius: 22, overflow: 'hidden',
          background: '#0d1117', aspectRatio: '4/3', marginBottom: 18,
          boxShadow: '0 20px 60px rgba(0,0,0,.3)'
        }}>
          <video ref={videoRef} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            display: scanning ? 'block' : 'none'
          }} autoPlay muted playsInline />

          {/* Idle state */}
          {!scanning && !cameraError && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'rgba(34,197,94,.1)', border: '2px solid rgba(34,197,94,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42
              }}>📷</div>
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
                Tap <strong style={{ color: '#fff' }}>Start Camera Scanner</strong><br />
                to activate live barcode scanning
              </p>
            </div>
          )}

          {/* Error state */}
          {cameraError && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center'
            }}>
              <span style={{ fontSize: 40 }}>⚠️</span>
              <p style={{ color: '#fca5a5', margin: 0, fontSize: 13, lineHeight: 1.6 }}>{cameraError}</p>
              <p style={{ color: '#64748b', margin: 0, fontSize: 12 }}>Use manual entry below 👇</p>
            </div>
          )}

          {/* Scanning overlay */}
          {scanning && (<>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to right,rgba(0,0,0,.55) 12%,transparent 12%,transparent 88%,rgba(0,0,0,.55) 88%)'
            }} />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'linear-gradient(to bottom,rgba(0,0,0,.55) 28%,transparent 28%,transparent 72%,rgba(0,0,0,.55) 72%)'
            }} />
            {/* Corners */}
            {[
              { top: '28%', left: '12%', borderTop: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '6px 0 0 0' },
              { top: '28%', right: '12%', borderTop: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 6px 0 0' },
              { bottom: '28%', left: '12%', borderBottom: '3px solid #22c55e', borderLeft: '3px solid #22c55e', borderRadius: '0 0 0 6px' },
              { bottom: '28%', right: '12%', borderBottom: '3px solid #22c55e', borderRight: '3px solid #22c55e', borderRadius: '0 0 6px 0' },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 28, height: 28, ...s }} />
            ))}
            {/* Laser */}
            <div style={{
              position: 'absolute', left: '12%', right: '12%', height: 2, top: '28%',
              background: 'linear-gradient(90deg,transparent,#22c55e 30%,#4ade80 50%,#22c55e 70%,transparent)',
              boxShadow: '0 0 12px #22c55e', animation: 'laserMove 2s ease-in-out infinite'
            }} />
            {/* Status pill */}
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,.75)', borderRadius: 20, padding: '6px 16px',
              display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.2s ease-in-out infinite' }} />
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Scanning for barcode…</span>
            </div>
          </>)}

          {/* Loading */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,.65)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 14, backdropFilter: 'blur(6px)'
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,.15)', borderTop: '3px solid #22c55e',
                animation: 'spin .9s linear infinite'
              }} />
              <p style={{ color: '#fff', margin: 0, fontWeight: 700, fontSize: 14 }}>Looking up product…</p>
            </div>
          )}
        </div>

        {/* Start / Stop Button */}
        <button
          className="bc-btn"
          onClick={scanning ? stopScanning : startScanning}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 16, border: 'none',
            cursor: 'pointer', fontWeight: 800, fontSize: 16, transition: 'all .2s',
            background: scanning ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#22c55e,#15803d)',
            color: '#fff', marginBottom: 16,
            boxShadow: scanning ? '0 8px 24px rgba(239,68,68,.35)' : '0 8px 24px rgba(34,197,94,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
          }}
        >
          <span style={{ fontSize: 22 }}>{scanning ? '⏹' : '📷'}</span>
          {scanning ? 'Stop Camera' : 'Start Camera Scanner'}
        </button>

        {/* Scanned code badge */}
        {scannedCode && (
          <div style={{
            background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #86efac',
            borderRadius: 14, padding: '12px 16px', marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 12, animation: 'codeFade .3s ease'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: '#22c55e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20
            }}>✅</div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 12, color: '#15803d', fontWeight: 800, letterSpacing: .5, textTransform: 'uppercase' }}>Barcode Detected</p>
              <p style={{ margin: 0, fontSize: 14, color: '#14532d', fontFamily: 'monospace', fontWeight: 700 }}>{scannedCode}</p>
            </div>
          </div>
        )}

        {foundProduct && (
          <div style={{
            background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 22,
            padding: 20, marginBottom: 20, boxShadow: '0 8px 30px rgba(0,0,0,.08)',
            animation: 'slideUp .35s cubic-bezier(.175,.885,.32,1.275)'
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={foundProduct.image?.[0]} alt={foundProduct.name}
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 14, border: '1.5px solid #f0fdf4' }} />
                <div style={{
                  position: 'absolute', bottom: -6, right: -6, background: '#22c55e', borderRadius: '50%',
                  width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, border: '2px solid #fff', fontWeight: 700, color: '#fff'
                }}>✓</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>✓ IN STOCK</span>
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>{foundProduct.category}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: '#111827', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {foundProduct.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#16a34a' }}>{currency}{foundProduct.offerPrice}</span>
                  {foundProduct.price !== foundProduct.offerPrice && (
                    <span style={{ fontSize: 13, color: '#d1d5db', textDecoration: 'line-through' }}>{currency}{foundProduct.price}</span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button onClick={handleAddToCart} disabled={addedToCart} className="bc-btn" style={{
                flex: 1, padding: '13px 0', borderRadius: 14, border: 'none',
                cursor: addedToCart ? 'default' : 'pointer', fontWeight: 800, fontSize: 15,
                background: addedToCart ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#22c55e,#15803d)',
                color: '#fff', boxShadow: '0 6px 18px rgba(34,197,94,.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s'
              }}>
                <span style={{ fontSize: 20 }}>{addedToCart ? '✅' : '🛒'}</span>
                {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button onClick={() => navigate(`/products/${foundProduct.category?.toLowerCase()}/${foundProduct._id}`)}
                title="View details" style={{
                  width: 50, height: 50, borderRadius: 14, border: '1.5px solid #e5e7eb',
                  background: '#f9fafb', cursor: 'pointer', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20
                }}>👁</button>
            </div>

            {addedToCart && (
              <button onClick={() => navigate('/cart')} style={{
                width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 12,
                border: '1.5px solid #22c55e', background: '#f0fdf4', color: '#15803d',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>🛒 View Cart & Checkout →</button>
            )}
          </div>
        )}

        {/* Not Found Card */}
        {notFoundCode && !foundProduct && (
          <div style={{
            background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 22,
            padding: 20, marginBottom: 20, boxShadow: '0 8px 30px rgba(239,68,68,.08)',
            animation: 'slideUp .35s cubic-bezier(.175,.885,.32,1.275)',
            display: 'flex', alignItems: 'center', gap: 16
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: 14, background: '#fee2e2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0
            }}>🔍</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: 15, color: '#b91c1c' }}>
                {notFoundCode?.externalName
                  ? `"${notFoundCode.externalName}"`
                  : 'Product Not Found'}
              </p>
              <p style={{ margin: '0 0 6px', fontSize: 12, color: '#ef4444' }}>
                {notFoundCode?.message || 'This item is not available in our store.'}
              </p>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 11, color: '#9ca3af', background: '#f3f4f6', padding: '3px 8px', borderRadius: 6, display: 'inline-block' }}>
                {notFoundCode?.code}
              </p>
            </div>
          </div>
        )}




        {/* ── Upload Image ── */}
        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 18, padding: 20, marginBottom: 16 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 15, color: '#15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🖼️</span> Upload Barcode Image
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#4b7a5a' }}>Take a photo of the barcode &amp; upload — AI will decode it automatically.</p>

          <input
            type="file"
            accept="image/*"
            ref={uploadInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

          {uploadPreview && (
            <div style={{ marginBottom: 12, position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #bbf7d0', maxHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <img src={uploadPreview} alt="Uploaded barcode" style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }} />
              {imageUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(255,255,255,.2)', borderTop: '3px solid #22c55e', animation: 'spin .9s linear infinite' }} />
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Scanning image…</span>
                </div>
              )}
            </div>
          )}

          <button
            className="bc-btn"
            onClick={() => uploadInputRef.current.click()}
            disabled={imageUploading}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
              cursor: imageUploading ? 'not-allowed' : 'pointer', fontWeight: 800, fontSize: 15,
              background: imageUploading ? '#d1fae5' : 'linear-gradient(135deg,#22c55e,#15803d)',
              color: imageUploading ? '#15803d' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all .2s',
              boxShadow: imageUploading ? 'none' : '0 6px 18px rgba(34,197,94,.35)'
            }}
          >
            <span style={{ fontSize: 20 }}>📁</span>
            {imageUploading ? 'Reading barcode…' : 'Choose Photo from Gallery'}
          </button>
        </div>

        {/* ── Manual Entry ── */}
        <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: 20, marginBottom: 20 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 15, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⌨️</span> Manual Barcode Entry
          </p>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#94a3b8' }}>Camera not available? Type or paste the barcode number.</p>
          <form onSubmit={handleManualLookup} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="e.g. 8901030799174"
              inputMode="numeric"
              className="bc-input"
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 12, border: '1.5px solid #cbd5e1',
                background: '#fff', fontSize: 14, fontFamily: 'monospace', color: '#1e293b', transition: 'border .2s'
              }}
            />
            <button type="submit" disabled={!manualCode.trim() || loading} className="bc-btn" style={{
              padding: '11px 22px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg,#22c55e,#15803d)', color: '#fff',
              fontWeight: 800, fontSize: 14, opacity: !manualCode.trim() || loading ? .5 : 1,
              cursor: !manualCode.trim() || loading ? 'not-allowed' : 'pointer', transition: 'all .2s'
            }}>{loading ? '…' : 'Search'}</button>
          </form>
        </div>

        {/* ── How to use ── */}
        <div style={{ background: 'linear-gradient(135deg,#fffbeb,#fefce8)', border: '1px solid #fde68a', borderRadius: 18, padding: 18 }}>
          <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 14, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
            💡 How To Use
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['1', 'Tap Start Camera Scanner', 'Allow camera permission when asked'],
              ['2', 'Point at any product barcode', 'Milk, chips, anything from home!'],
              ['3', 'Product appears automatically', 'Or type barcode manually below'],
              ['4', 'Tap Add to Cart & checkout', 'Shopping done! 🛒'],
            ].map(([num, title, sub]) => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 13, color: '#78350f'
                }}>{num}</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#78350f' }}>{title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#a16207' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,.6)', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
            ✅ <strong>Works on:</strong> Chrome, Firefox, Edge, Safari (iOS 16+)<br />
            📱 <strong>Best experience:</strong> Chrome on Android with back camera
          </div>
        </div>
      </>)}

      {/* ══════ HISTORY TAB ══════ */}
      {activeTab === 'history' && (
        <div>
          {scanHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#f9fafb', borderRadius: 22, color: '#9ca3af' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🕓</div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 16 }}>No scans yet</p>
              <p style={{ margin: 0, fontSize: 13 }}>Your recent scans will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {scanHistory.map((item, i) => (
                <div key={i} className="bc-hist" style={{
                  background: '#fff', border: '1.5px solid #f1f5f9', borderRadius: 18,
                  padding: 16, display: 'flex', alignItems: 'center', gap: 14,
                  boxShadow: '0 2px 12px rgba(0,0,0,.05)', cursor: 'default', transition: 'background .15s'
                }}>
                  {item.product
                    ? <img src={item.product.image?.[0]} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 56, height: 56, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>❌</div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 3px', fontWeight: 700, fontSize: 14, color: '#111827', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {item.product ? item.product.name : 'Not found in store'}
                    </p>
                    <p style={{ margin: '0 0 2px', fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{item.code}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#cbd5e1' }}>{item.time.toLocaleTimeString()}</p>
                  </div>
                  {item.product && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 900, color: '#16a34a', fontSize: 16 }}>{currency}{item.product.offerPrice}</p>
                      <button onClick={() => { addToCart(item.product._id); }} className="bc-btn" style={{
                        padding: '6px 14px', borderRadius: 10, border: 'none',
                        background: 'linear-gradient(135deg,#22c55e,#15803d)',
                        color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer'
                      }}>+ Cart</button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => setScanHistory([])} style={{
                padding: '11px 0', borderRadius: 14, border: '1.5px solid #fecaca',
                background: '#fff', color: '#ef4444', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 4
              }}>🗑 Clear History</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarcodeScan;
