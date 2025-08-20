import { TbTrash, TbVolume, TbVolumeOff } from "solid-icons/tb";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
	type Setter,
} from "solid-js";
import { MAX_FREQUENCY, MIN_FREQUENCY } from "../constants";
import type { WaveModel } from "../types";
import { getAudio, makeWaveNodes } from "../utils/audio";
import { findNearestNote } from "../utils/music";
import NotePicker from "./NotePicker";
import IconButton from "./ui/IconButton";

type Props = {
	wave: WaveModel;
	onChange: (id: string, patch: Partial<WaveModel>) => void;
	onDelete: (id: string) => void;
};

function MuteButton(props: { muted: Accessor<boolean>; onToggle: () => void }) {
	return (
		<IconButton
			onClick={props.onToggle}
			title="Mute/unmute"
			aria-label="Mute/unmute"
		>
			{props.muted() ? <TbVolumeOff /> : <TbVolume />}
		</IconButton>
	);
}

function VolumeControl(props: {
	value: Accessor<number>;
	setValue: Setter<number>;
}) {
	return (
		<input
			type="range"
			min="0"
			max="1"
			step="0.01"
			value={props.value()}
			class="w-24 h-2 cursor-pointer slider"
			onInput={(e) =>
				props.setValue(Number((e.currentTarget as HTMLInputElement).value))
			}
			onChange={(e) =>
				props.setValue(Number((e.currentTarget as HTMLInputElement).value))
			}
			style={{ "--value": props.value(), "--min": 0, "--max": 1 }}
		/>
	);
}

function FrequencyControl(props: {
	min: number;
	max: number;
	value: Accessor<number>;
	setValue: Setter<number>;
}) {
	return (
		<input
			type="range"
			min={props.min}
			max={props.max}
			step="1"
			value={props.value()}
			style={{
				"--value": props.value(),
				"--min": props.min,
				"--max": props.max,
			}}
			class="w-full h-3 cursor-pointer slider"
			onInput={(e) =>
				props.setValue(Number((e.currentTarget as HTMLInputElement).value))
			}
			onChange={(e) =>
				props.setValue(Number((e.currentTarget as HTMLInputElement).value))
			}
		/>
	);
}

function FrequencyReadout(props: { value: Accessor<number> }) {
	const nearest = createMemo(() => {
		const freq = props.value();
		if (freq < MIN_FREQUENCY || freq > MAX_FREQUENCY) return null;
		return findNearestNote(freq);
	});
	const nearestNoteFormatted = createMemo(() => {
		const nearestNote = nearest();
		return nearestNote
			? `(${nearestNote.absCents > 0 ? "~ " : ""}${nearestNote.root}${nearestNote.octave})`
			: "";
	});
	return (
		<>
			<span class="ml-auto font-mono text-sm tabular-nums text-right w-fit">
				{props.value()} Hz{" "}
				<span class="text-sm text-right text-base04">
					{nearestNoteFormatted()}
				</span>
			</span>
		</>
	);
}

function ColorPicker(props: {
	value: Accessor<string>;
	setValue: Setter<string>;
}) {
	return (
		<input
			type="color"
			value={props.value()}
			class="w-9 h-9 rounded-md border-0 outline-0"
			title="Wave color"
			onInput={(e) => {
				const c = (e.currentTarget as HTMLInputElement).value;
				props.setValue(c);
			}}
		/>
	);
}

function DeleteButton(props: { onClick: () => void }) {
	return (
		<IconButton
			tone="danger"
			onClick={props.onClick}
			title="Delete wave"
			aria-label="Delete wave"
		>
			<TbTrash />
		</IconButton>
	);
}

export default function WaveRow(props: Props) {
	const [freq, setFreq] = createSignal(props.wave.freq);
	const [volume, setVolume] = createSignal(props.wave.volume);
	const [muted, setMuted] = createSignal(props.wave.muted);
	const [color, setColor] = createSignal(props.wave.color);

	const { audioCtx } = getAudio();
	const nodes = makeWaveNodes(freq(), muted() ? 0 : volume());

	onCleanup(() => {
		try {
			nodes.stop();
		} catch {}
	});

	createEffect(() => {
		nodes.osc.frequency.setValueAtTime(freq(), audioCtx.currentTime);
	});
	createEffect(() => {
		nodes.gain.gain.setTargetAtTime(
			muted() ? 0 : volume(),
			audioCtx.currentTime,
			0.01,
		);
	});

	const toggleMute = () => {
		const next = !muted();
		setMuted(next);
		props.onChange(props.wave.id, { muted: next });
	};

	const del = () => props.onDelete(props.wave.id);

	return (
		<div
			class="overflow-visible relative p-3 rounded-xl border ring-1 ring-transparent shadow-sm transition border-base02/60 bg-base00/60 hover:ring-base02/70"
			style={{ "--wave-color": color() }}
		>
			<div class="flex relative z-10 flex-col gap-2">
				<div class="flex gap-3 items-center">
					<MuteButton muted={muted} onToggle={toggleMute} />
					<VolumeControl value={volume} setValue={setVolume} />
					<FrequencyReadout value={freq} />
					<DeleteButton onClick={del} />
				</div>

				<div class="flex gap-3 items-center">
					<div class="flex-1">
						<FrequencyControl
							min={MIN_FREQUENCY}
							max={MAX_FREQUENCY}
							value={freq}
							setValue={setFreq}
						/>
					</div>
					<ColorPicker value={color} setValue={setColor} />
				</div>

				<div class="pt-2">
					<NotePicker
						onSetFrequency={(f: number) => {
							const clamped = Math.max(
								MIN_FREQUENCY,
								Math.min(MAX_FREQUENCY, f),
							);
							setFreq(clamped);
						}}
					/>
				</div>
			</div>
		</div>
	);
}
