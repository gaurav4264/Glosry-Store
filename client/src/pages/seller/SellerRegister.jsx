import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SHOP_CATEGORIES = [
    'Grocery', 'Vegetables', 'Fruits', 'Dairy', 'Snacks',
    'Household Items', 'Bakery', 'Beverages', 'Personal Care', 'Other'
];

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Chandigarh', 'Puducherry'
];

const STEPS = [
    { id: 1, title: 'Personal Info', icon: '👤' },
    { id: 2, title: 'Shop Details', icon: '🏪' },
    { id: 3, title: 'Documents', icon: '📄' },
    { id: 4, title: 'Review & Submit', icon: '✅' }
];

const FileUploadBox = ({ label, name, onChange, preview, accept = "image/*", required }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all">
            {preview ? (
                <img src={preview} alt="preview" className="h-32 w-full object-contain rounded-xl" />
            ) : (
                <div className="flex flex-col items-center py-4">
                    <span className="text-3xl mb-2">📁</span>
                    <p className="text-sm text-indigo-600 font-medium">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
            )}
            <input type="file" name={name} accept={accept} onChange={onChange} className="hidden" />
        </label>
    </div>
);

const SellerRegister = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showOtpBox, setShowOtpBox] = useState(false);

    const [form, setForm] = useState({
        fullName: '', mobileNumber: '', email: '', aadhaarNumber: '', panNumber: '',
        bankAccountNumber: '', ifscCode: '', gstNumber: '',
        shopName: '', shopCategory: '', shopAddress: '', area: '', pickupAddress: '',
        city: '', state: '', pinCode: '', landmark: '', latitude: '', longitude: ''
    });

    const [files, setFiles] = useState({ aadhaarImage: null, panImage: null, passportPhoto: null, shopLogo: null });
    const [previews, setPreviews] = useState({ aadhaarImage: '', panImage: '', passportPhoto: '', shopLogo: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        if (fileList[0]) {
            setFiles(prev => ({ ...prev, [name]: fileList[0] }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(fileList[0]) }));
        }
    };

    const getLocation = () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm(prev => ({ ...prev, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
                setLocationLoading(false);
                toast.success('Location captured!');
            },
            () => { setLocationLoading(false); toast.error('Could not get location'); }
        );
    };

    const sendOtp = async () => {
        if (!/^\d{10}$/.test(form.mobileNumber)) return toast.error('Enter a valid 10-digit mobile number');
        setOtpLoading(true);
        try {
            const { data } = await axios.post('/api/seller-application/send-otp', { mobile: form.mobileNumber });
            if (data.success) {
                setOtpSent(true);
                setShowOtpBox(true);
                toast.success('OTP sent! Check console/server log for dev OTP.');
                // Auto-fill OTP in dev
                if (data.otp) setOtpValue(data.otp);
            } else toast.error(data.message);
        } catch { toast.error('Failed to send OTP'); }
        finally { setOtpLoading(false); }
    };

    const verifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) return toast.error('Enter the 6-digit OTP');
        setOtpLoading(true);
        try {
            const { data } = await axios.post('/api/seller-application/verify-otp', { mobile: form.mobileNumber, otp: otpValue });
            if (data.success) {
                setOtpVerified(true);
                setShowOtpBox(false);
                toast.success('Mobile verified! ✅');
            } else toast.error(data.message);
        } catch { toast.error('OTP verification failed'); }
        finally { setOtpLoading(false); }
    };

    const validateStep = () => {
        if (step === 1) {
            if (!form.fullName || !form.mobileNumber || !form.email || !form.aadhaarNumber || !form.panNumber || !form.bankAccountNumber || !form.ifscCode)
                return toast.error('Please fill all required fields'), false;
            if (!/^\d{12}$/.test(form.aadhaarNumber)) return toast.error('Aadhaar must be 12 digits'), false;
            if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) return toast.error('Invalid PAN format (e.g., ABCDE1234F)'), false;
            if (!/^\d{10}$/.test(form.mobileNumber)) return toast.error('Mobile must be 10 digits'), false;
            // OTP is recommended but not blocking (verify your mobile for better security)
        }
        if (step === 2) {
            if (!form.shopName || !form.shopCategory || !form.shopAddress || !form.city || !form.state || !form.pinCode)
                return toast.error('Please fill all required shop fields'), false;
            if (!/^\d{6}$/.test(form.pinCode)) return toast.error('PIN Code must be 6 digits'), false;
        }
        if (step === 3) {
            if (!files.aadhaarImage || !files.panImage || !files.passportPhoto)
                return toast.error('Please upload all required documents (Aadhaar, PAN, Passport Photo)'), false;
        }
        return true;
    };

    const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.set('panNumber', form.panNumber.toUpperCase());
            if (files.aadhaarImage) formData.append('aadhaarImage', files.aadhaarImage);
            if (files.panImage) formData.append('panImage', files.panImage);
            if (files.passportPhoto) formData.append('passportPhoto', files.passportPhoto);
            if (files.shopLogo) formData.append('shopLogo', files.shopLogo);

            const { data } = await axios.post('/api/seller-application/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                navigate('/seller-register/success', {
                    state: {
                        applicationNumber: data.applicationNumber,
                        shopRegNumber: data.shopRegNumber,
                        sellerId: data.sellerId,
                        shopName: form.shopName,
                        fullName: form.fullName
                    }
                });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-4 text-center shadow-lg">
                <h1 className="text-3xl font-bold mb-1">🛒 Seller Registration</h1>
                <p className="text-indigo-200 text-sm">Join our marketplace as a verified seller</p>
            </div>

            {/* Step Indicator */}
            <div className="max-w-4xl mx-auto px-4 pt-8">
                <div className="flex items-center justify-between mb-10 relative">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 z-0">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                        />
                    </div>
                    {STEPS.map(s => (
                        <div key={s.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${step >= s.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-400'}`}>
                                {step > s.id ? '✓' : s.icon}
                            </div>
                            <span className={`mt-2 text-xs font-semibold ${step >= s.id ? 'text-indigo-600' : 'text-gray-400'}`}>{s.title}</span>
                        </div>
                    ))}
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100">

                    {/* STEP 1: Personal Info */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">👤 Personal Verification</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { label: 'Full Name (as per Aadhaar)', name: 'fullName', placeholder: 'Ramesh Kumar', required: true },
                                    { label: 'Email ID', name: 'email', type: 'email', placeholder: 'seller@email.com', required: true },
                                    { label: 'Aadhaar Card Number', name: 'aadhaarNumber', placeholder: '123456789012', required: true, maxLength: 12 },
                                    { label: 'PAN Card Number', name: 'panNumber', placeholder: 'ABCDE1234F', required: true, maxLength: 10, uppercase: true },
                                    { label: 'Bank Account Number', name: 'bankAccountNumber', placeholder: 'Account Number', required: true },
                                    { label: 'IFSC Code', name: 'ifscCode', placeholder: 'SBIN0001234', required: true, uppercase: true },
                                    { label: 'GST Number (Optional)', name: 'gstNumber', placeholder: '22AAAAA0000A1Z5' }
                                ].map(field => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        <input
                                            type={field.type || 'text'}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            maxLength={field.maxLength}
                                            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all bg-gray-50 ${field.uppercase ? 'uppercase' : ''}`}
                                        />
                                    </div>
                                ))}

                                {/* Mobile with OTP */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                name="mobileNumber"
                                                value={form.mobileNumber}
                                                onChange={(e) => { handleChange(e); setOtpVerified(false); setOtpSent(false); setShowOtpBox(false); }}
                                                placeholder="9876543210"
                                                maxLength={10}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                                            />
                                            {otpVerified && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 font-bold text-xs bg-green-50 px-2 py-1 rounded-full">✅ Verified</span>
                                            )}
                                        </div>
                                        {!otpVerified && (
                                            <button
                                                type="button"
                                                onClick={sendOtp}
                                                disabled={otpLoading || !form.mobileNumber}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {otpLoading && !showOtpBox ? '⏳ Sending...' : otpSent ? '🔄 Resend OTP' : '📱 Send OTP'}
                                            </button>
                                        )}
                                    </div>
                                    {showOtpBox && !otpVerified && (
                                        <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                            <p className="text-xs text-indigo-700 font-semibold mb-2">Enter 6-digit OTP sent to {form.mobileNumber}</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={otpValue}
                                                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    placeholder="6-digit OTP"
                                                    maxLength={6}
                                                    className="flex-1 border border-indigo-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white tracking-widest font-mono text-center"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={verifyOtp}
                                                    disabled={otpLoading}
                                                    className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {otpLoading ? '⏳' : '✅ Verify'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Shop Details */}
                    {step === 2 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">🏪 Shop Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="shopName" value={form.shopName} onChange={handleChange} placeholder="e.g. Ramesh Grocery Store" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Category <span className="text-red-500">*</span></label>
                                    <select name="shopCategory" value={form.shopCategory} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50">
                                        <option value="">Select Category</option>
                                        {SHOP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Address <span className="text-red-500">*</span></label>
                                    <textarea name="shopAddress" value={form.shopAddress} onChange={handleChange} rows={2} placeholder="Shop No., Building Name, Street Name..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Area / Sector</label>
                                    <input type="text" name="area" value={form.area} onChange={handleChange} placeholder="e.g. Sector 17, Model Town" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                                    <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Chandigarh" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                                    <select name="state" value={form.state} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50">
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code <span className="text-red-500">*</span></label>
                                    <input type="text" name="pinCode" value={form.pinCode} onChange={handleChange} placeholder="160017" maxLength={6} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Landmark</label>
                                    <input type="text" name="landmark" value={form.landmark} onChange={handleChange} placeholder="Near Railway Station" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Address <span className="text-xs text-gray-400 ml-2">(if different from shop address)</span></label>
                                    <textarea name="pickupAddress" value={form.pickupAddress} onChange={handleChange} rows={2} placeholder="Full pickup address for order collection..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 resize-none" />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                <h3 className="text-sm font-bold text-indigo-800 mb-3 flex items-center gap-2">📍 Live Shop Location</h3>
                                <button type="button" onClick={getLocation} disabled={locationLoading} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-60 flex items-center gap-2">
                                    {locationLoading ? <span className="animate-spin">⏳</span> : '📡'} {locationLoading ? 'Getting Location...' : 'Capture My Location'}
                                </button>
                                {form.latitude && form.longitude && (
                                    <div className="mt-3 flex gap-3">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">✓ Lat: {form.latitude}</span>
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-semibold">✓ Lng: {form.longitude}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Document Uploads */}
                    {step === 3 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">📄 Document Upload</h2>
                            <p className="text-sm text-gray-500 mb-6">Upload clear photos of your documents. Max 5MB each.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <FileUploadBox label="Aadhaar Card" name="aadhaarImage" onChange={handleFileChange} preview={previews.aadhaarImage} required />
                                <FileUploadBox label="PAN Card" name="panImage" onChange={handleFileChange} preview={previews.panImage} required />
                                <FileUploadBox label="Passport Size Photo" name="passportPhoto" onChange={handleFileChange} preview={previews.passportPhoto} required />
                                <FileUploadBox label="Shop Logo (Optional)" name="shopLogo" onChange={handleFileChange} preview={previews.shopLogo} />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm text-amber-700 font-medium">⚠️ All documents are securely encrypted and stored. Only admin can view them for verification.</p>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Review & Submit */}
                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">✅ Review & Submit</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                                    <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">👤 Personal Information</h3>
                                    {[
                                        ['Full Name', form.fullName], ['Mobile', form.mobileNumber + ' ✅'], ['Email', form.email],
                                        ['Aadhaar', form.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim()],
                                        ['PAN', form.panNumber.toUpperCase()], ['Bank Account', form.bankAccountNumber],
                                        ['IFSC Code', form.ifscCode.toUpperCase()], ['GST', form.gstNumber || 'N/A']
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-indigo-100 last:border-0">
                                            <span className="text-gray-500 font-medium">{k}</span>
                                            <span className="text-gray-800 font-semibold text-right max-w-[55%] break-all">{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                    <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">🏪 Shop Details</h3>
                                    {[
                                        ['Shop Name', form.shopName], ['Category', form.shopCategory],
                                        ['Address', form.shopAddress], ['Area / Sector', form.area || 'N/A'],
                                        ['City', form.city], ['State', form.state],
                                        ['PIN Code', form.pinCode], ['Pickup Address', form.pickupAddress || 'Same as shop'],
                                        ['Location', form.latitude ? `${form.latitude}, ${form.longitude}` : 'Not captured']
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm py-1.5 border-b border-purple-100 last:border-0">
                                            <span className="text-gray-500 font-medium">{k}</span>
                                            <span className="text-gray-800 font-semibold text-right max-w-[55%]">{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Document preview */}
                            <div className="mt-5 bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <h3 className="font-bold text-gray-700 mb-3">📄 Uploaded Documents</h3>
                                <div className="flex gap-4 flex-wrap">
                                    {[['Aadhaar', previews.aadhaarImage], ['PAN Card', previews.panImage], ['Passport Photo', previews.passportPhoto], ['Shop Logo', previews.shopLogo]].map(([name, url]) => (
                                        <div key={name} className="text-center">
                                            {url ? <img src={url} alt={name} className="w-24 h-16 object-cover rounded-lg border-2 border-green-400 shadow" /> : <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">No file</div>}
                                            <p className="text-xs text-gray-600 mt-1 font-medium">{name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-700">✅ By submitting, you confirm that all information is accurate and you agree to our Terms & Conditions. Application will be reviewed within 2–3 business days.</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <button
                            onClick={step === 1 ? () => navigate('/seller-vendor-login') : prevStep}
                            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                        >
                            {step === 1 ? '← Back to Login' : '← Previous'}
                        </button>
                        {step < 4 ? (
                            <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all">
                                Next Step →
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
                                {loading ? <span className="animate-spin">⌛</span> : '🚀'} {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerRegister;
