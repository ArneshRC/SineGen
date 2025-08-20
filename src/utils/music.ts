import { NOTE_FREQUENCY_MAP } from "../constants";

/**
 * Use cents (logarithmic pitch distance) to find the nearest note.
 * cents = 1200 * log2(f / f_ref)
 *
 * @param freq - Frequency in Hz to find the nearest note for.
 * @returns An object with note details or null if invalid frequency.
 */
export function findNearestNote(freq: number) {
	if (!freq || freq <= 0) {
		return null;
	}

	let bestName: string | null = null;
	let bestAbsCents = Infinity;
	let bestCents = 0;

	for (const key of Object.keys(NOTE_FREQUENCY_MAP)) {
		const ref = NOTE_FREQUENCY_MAP[key as keyof typeof NOTE_FREQUENCY_MAP];
		const cents = 1200 * (Math.log(freq / ref) / Math.log(2));
		const absC = Math.abs(cents);
		if (absC < bestAbsCents) {
			bestAbsCents = absC;
			bestName = key;
			bestCents = cents;
		}
	}

	if (!bestName) return null;

	const m = bestName.match(/^([A-G]#?)(\d)$/);
	const root = m ? m[1] : bestName.replace(/\d+$/, "");
	const octave = m ? Number(m[2]) : Number(bestName.replace(/^[A-G]#?/, ""));

	return {
		name: bestName,
		root,
		octave,
		cents: bestCents,
		absCents: bestAbsCents,
	};
}
