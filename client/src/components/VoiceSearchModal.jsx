import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const VoiceSearchModal = ({ isOpen, onClose, onSearch }) => {
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState('initializing'); // initializing, listening, processing, error

    useEffect(() => {
        let recognition = null;

        if (isOpen) {
            setTranscript('');
            setStatus('initializing');

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setStatus('error');
                toast.error("Voice search is not supported in this browser.");
                setTimeout(onClose, 2000);
                return;
            }

            recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = true; // Show words as they are spoken
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setStatus('listening');
            };

            recognition.onresult = (event) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }

                // Remove trailing period the browser might add
                currentTranscript = currentTranscript.replace(/\.$/, '').trim();
                setTranscript(currentTranscript);

                if (event.results[0].isFinal) {
                    setStatus('processing');
                    setTimeout(() => {
                        onSearch(currentTranscript);
                        onClose();
                    }, 800);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setStatus('error');
                if (event.error === 'not-allowed') {
                    toast.error('Microphone access denied. Please allow it in your browser settings.');
                }
                setTimeout(onClose, 2500);
            };

            recognition.onend = () => {
                // If it ends but we haven't processed a final result or hit an error, it might have timed out
                if (status === 'listening') {
                    onClose();
                }
            };

            try {
                recognition.start();
            } catch (err) {
                console.error(err);
                setStatus('error');
                setTimeout(onClose, 2000);
            }
        }

        return () => {
            if (recognition) {
                recognition.abort();
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-sm w-full mx-4 flex flex-col items-center justify-center relative overflow-hidden transform scale-100 animate-[fadeIn_0.3s_ease-out]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                    ✕
                </button>

                <div className="mb-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {status === 'initializing' && 'Starting...'}
                        {status === 'listening' && 'Listening...'}
                        {status === 'processing' && 'Searching...'}
                        {status === 'error' && 'Oops!'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {status === 'listening' ? 'Speak what you are looking for' : ' '}
                    </p>
                </div>

                {/* Animated Microphone Area */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-8 mt-4">
                    {status === 'listening' && (
                        <>
                            {/* Ripples */}
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                            <div className="absolute inset-2 bg-primary/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        </>
                    )}

                    <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${status === 'listening' ? 'bg-primary text-white scale-110 shadow-primary/40' : status === 'error' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                            {status === 'error' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Live Transcript Display */}
                <div className="h-16 flex items-center justify-center w-full px-4 text-center">
                    <p className={`text-xl font-medium ${transcript ? 'text-gray-800' : 'text-gray-300'}`}>
                        {transcript ? `"${transcript}"` : (status === 'listening' ? '...' : '')}
                    </p>
                </div>

            </div>
        </div>
    );
};

export default VoiceSearchModal;
