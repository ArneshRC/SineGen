import type { WaveModel } from "../types";

export function newWave(): WaveModel {
	return {
		id: Math.random().toString(36).slice(2),
		freq: 440,
		volume: 0.3,
		muted: false,
		color: "#7cafc2",
	};
}
