export const getAudioContext = (() => {
  let ctx: AudioContext | null = null;
  return () => {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      ctx = new AudioContextClass();
    }
    return ctx;
  };
})();

export const resumeAudioContext = () => {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
};
