import { createSignal } from "solid-js";

import Header from "./components/Header";
import Section from "./components/ui/Section";
import WavesList from "./components/WavesList";

import type { WaveModel } from "./types";

import { ensureAudio, startPlayback, stopPlayback } from "./utils/audio";
import { newWave } from "./utils/waves";

export default function App() {
	const [waves, setWaves] = createSignal<WaveModel[]>([newWave()]);
	const [playing, setPlaying] = createSignal(false);

	const togglePlay = async () => {
		ensureAudio();
		if (!playing()) {
			await startPlayback();
			setPlaying(true);
		} else {
			stopPlayback();
			setPlaying(false);
		}
	};

	const addWave = () => setWaves((ws) => [...ws, newWave()]);
	const changeWave = (id: string, patch: Partial<WaveModel>) =>
		setWaves((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w)));
	const deleteWave = (id: string) =>
		setWaves((ws) => ws.filter((w) => w.id !== id));

	return (
		<div>
			<Header playing={playing} onTogglePlay={togglePlay} onAddWave={addWave} />

			<Section>
				<WavesList waves={waves} onChange={changeWave} onDelete={deleteWave} />
			</Section>
		</div>
	);
}
