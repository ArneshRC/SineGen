let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

export const ensureAudio = () => {
	if (!audioCtx) {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;

		if (!AudioContext) {
			throw new Error("AudioContext is not supported in this browser.");
		}
		audioCtx = new AudioContext();
		masterGain = audioCtx.createGain();
		masterGain.gain.value = 0;
		masterGain.connect(audioCtx.destination);
	}
	return { audioCtx: audioCtx!, masterGain: masterGain! };
};

export async function startPlayback(target = 0.9) {
	const { audioCtx, masterGain } = ensureAudio();
	if (audioCtx.state !== "running") {
		try {
			await audioCtx.resume();
		} catch {}
	}
	masterGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.02);
}

export const getAudio = () => ensureAudio();

export function stopPlayback() {
	const { audioCtx, masterGain } = ensureAudio();
	masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);
}

export function isAudible() {
	const { audioCtx, masterGain } = ensureAudio();
	return audioCtx.state === "running" && masterGain.gain.value > 0.0001;
}

export function makeWaveNodes(freq: number, volume: number) {
	const { audioCtx, masterGain } = ensureAudio();
	const osc = audioCtx.createOscillator();
	const gain = audioCtx.createGain();
	osc.type = "sine";
	osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
	gain.gain.value = volume;
	osc.connect(gain).connect(masterGain);
	osc.start();
	return {
		osc,
		gain,
		stop: () => {
			try {
				osc.stop();
			} catch {}
			try {
				gain.disconnect();
			} catch {}
		},
	};
}
