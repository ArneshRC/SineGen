import {
	createEffect,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { Portal } from "solid-js/web";
import { NOTE_ORDER, OCTAVES } from "../constants";
import { rem2px } from "../utils/converters";
import { findNearestNote } from "../utils/music";

type NotePickerProps = {
	onSetFrequency: (f: number) => void;
	class?: string;
	currentFreq?: number;
};

const CLOSE_ANIM_MS = 200;

export default function NotePicker(props: NotePickerProps) {
	const [activeNote, setActiveNote] = createSignal<string | null>(null);
	const [menuVisible, setMenuVisible] = createSignal(false);
	const [menuState, setMenuState] = createSignal<"" | "open" | "closing">("");
	const [menuPos, setMenuPos] = createSignal({ left: 0, top: 0 });

	const buttonRefs: Record<string, HTMLButtonElement | null> =
		Object.create(null);
	const octaveButtonRefs: Array<HTMLButtonElement | null> = [];

	let docClickHandler: (e: MouseEvent) => void;
	let closeToken = 0;
	let finalCloseTimer: number | undefined;

	function clearFinalClose() {
		if (finalCloseTimer) {
			window.clearTimeout(finalCloseTimer);
			finalCloseTimer = undefined;
		}
	}

	function openFor(note: string, btnEl?: HTMLButtonElement) {
		closeToken += 1;
		clearFinalClose();

		const el = btnEl ?? buttonRefs[note];
		let desiredCenter: number;
		let desiredTop: number;

		const rect = el!.getBoundingClientRect();
		desiredCenter = rect.left + rect.width / 2;
		desiredTop = rect.bottom + 10 + window.scrollY;

		setMenuPos({ left: desiredCenter, top: desiredTop });

		setActiveNote(note);

		function measureAndApply() {
			const menu = document.querySelector(".note-menu") as HTMLElement;

			const menuW = rem2px(12);
			const menuH = rem2px(8);
			const margin = rem2px(0.75);

			let actualLeft = desiredCenter - menuW / 2;
			const minLeft = margin;
			const maxLeft = window.innerWidth - margin - menuW;
			if (actualLeft < minLeft) actualLeft = minLeft;
			if (actualLeft > maxLeft) actualLeft = maxLeft;

			let actualTop = desiredTop;
			if (desiredTop + menuH > window.innerHeight + window.scrollY - margin) {
				const btnRect = el!.getBoundingClientRect();
				const aboveTop = btnRect.top - 10 - menuH + window.scrollY;
				if (aboveTop >= margin) {
					actualTop = aboveTop;
				} else {
					actualTop = Math.max(margin, window.innerHeight - margin - menuH);
				}
			}
			if (actualTop < margin) actualTop = margin;

			menu.style.left = `${Math.round(actualLeft)}px`;
			menu.style.top = `${Math.round(actualTop)}px`;
		}

		if (!menuVisible()) {
			setMenuVisible(true);
			setMenuState("");
			measureAndApply();
			setTimeout(() => {
				setMenuState("open");
			}, 20);
		} else {
			setMenuState("open");
			requestAnimationFrame(() => measureAndApply());
		}
	}

	function closeMenu(immediate = false) {
		const token = ++closeToken;
		clearFinalClose();

		if (immediate) {
			setMenuState("");
			setMenuVisible(false);
			setActiveNote(null);
			return;
		}

		setMenuState("closing");
		finalCloseTimer = window.setTimeout(() => {
			if (token !== closeToken) return;
			setMenuVisible(false);
			setMenuState("");
			setActiveNote(null);
			clearFinalClose();
		}, CLOSE_ANIM_MS);
	}

	function toggleNoteClick(note: string, btnEl: HTMLButtonElement) {
		if (menuVisible() && activeNote() === note) {
			closeMenu();
			return;
		}
		openFor(note, btnEl);
	}

	function onOctaveSelect(index: number) {
		const note = activeNote();
		if (!note) return;
		const oct = OCTAVES[index];
		const key =
			`${note}${oct}` as keyof typeof import("../constants").NOTE_FREQUENCY_MAP;
		import("../constants").then((mod) => {
			props.onSetFrequency(mod.NOTE_FREQUENCY_MAP[key]);
		});
		clearFinalClose();
	}

	onMount(() => {
		docClickHandler = (e: MouseEvent) => {
			const t = e.target as Node | null;
			if (!t) return;
			for (const k of Object.keys(buttonRefs)) {
				const b = buttonRefs[k];
				if (b && b.contains(t)) return;
			}
			const menu = document.querySelector(".note-menu");
			if (menu && menu.contains(t)) return;
			closeMenu();
		};

		document.addEventListener("click", docClickHandler);
	});

	onCleanup(() => {
		document.removeEventListener("click", docClickHandler);
		clearFinalClose();
	});

	const nearestForFreq = () => {
		if (!props.currentFreq) return null;
		const n = findNearestNote(props.currentFreq);
		return n;
	};

	createEffect(() => {
		nearestForFreq();
	});

	return (
		<>
			<div
				class={`grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2 justify-center ${props.class ?? ""}`}
			>
				<For each={NOTE_ORDER}>
					{(note) => {
						return (
							<div class="flex col-span-1 justify-center">
								<button
									ref={(el) => {
										if (el) buttonRefs[note] = el;
									}}
									class={
										"w-full px-2 py-2 rounded-md border border-base02 text-sm font-medium transition active:translate-y-px text-center bg-base00 hover:bg-base02/40"
									}
									onClick={(e) =>
										toggleNoteClick(note, e.currentTarget as HTMLButtonElement)
									}
									title={`${note} - click to open octave menu`}
									aria-haspopup="true"
									aria-expanded={menuVisible() && activeNote() === note}
								>
									{note}
								</button>
							</div>
						);
					}}
				</For>
			</div>

			<Show when={menuVisible()}>
				<Portal>
					<div
						class={`note-menu ${menuState()} z-30`}
						style={{
							position: "absolute",
							left: `${menuPos().left}px`,
							top: `${menuPos().top}px`,
						}}
						role="menu"
						aria-hidden={menuState() === "" ? "true" : "false"}
					>
						<div class="grid grid-cols-3 gap-3">
							<For each={OCTAVES}>
								{(oct, i) => {
									const idx = i();
									const nearest = props.currentFreq
										? findNearestNote(props.currentFreq)
										: null;
									const isNearestOctave =
										nearest &&
										nearest.root === activeNote() &&
										nearest.octave === oct;
									return (
										<button
											ref={(el) => (octaveButtonRefs[idx] = el)}
											class={`px-1 py-2 rounded-md text-sm font-medium border border-base02 bg-base00 hover:bg-base02/60 transition note-menu-item w-full ${
												isNearestOctave ? "note-menu-item-active" : ""
											}`}
											onClick={() => onOctaveSelect(idx)}
											role="menuitem"
											tabindex={0}
										>
											{activeNote()}
											{oct}
										</button>
									);
								}}
							</For>
						</div>
					</div>
				</Portal>
			</Show>
		</>
	);
}
