
// Simple audio synthesizer for game sounds
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

export const playMatchSound = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
  oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // Slide up to A5

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
};

const speakEncouragement = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Ensure voices are loaded (for Chrome)
  const voices = window.speechSynthesis.getVoices();
  
  // Cancel previous speech to avoid queue buildup
  window.speechSynthesis.cancel();

  const phrases = [
      "Congratulations!", 
      "Great job!", 
      "You are smart!", 
      "Wonderful!", 
      "Excellent!", 
      "Well done!", 
      "Fantastic!",
      "Brilliant!",
      "You did it!",
      "So smart!",
      "Good job!"
  ];
  
  const text = phrases[Math.floor(Math.random() * phrases.length)];
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Try to pick a cheerful sounding English voice
  const preferredVoice = voices.find(v => v.name.includes('Google US English')) || 
                         voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) || 
                         voices.find(v => v.lang.startsWith('en'));
  
  if (preferredVoice) utterance.voice = preferredVoice;
  
  utterance.volume = 1;
  utterance.rate = 1.1; // Slightly faster/cheerful
  utterance.pitch = 1.2; // Slightly higher

  window.speechSynthesis.speak(utterance);
};

export const playWinSound = () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Play a major chord arpeggio
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
  const now = audioContext.currentTime;

  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = freq;
    
    const startTime = now + (i * 0.1);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.6);
  });

  // Trigger speech with a slight delay to layer nicely over the chord
  setTimeout(() => {
    speakEncouragement();
  }, 400);
};
