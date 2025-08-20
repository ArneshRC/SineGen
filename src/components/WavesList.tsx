import { For, type Accessor } from "solid-js";
import WaveRow from "./WaveRow";
import type { WaveModel } from "../types";

type WavesListProps = {
	waves: Accessor<WaveModel[]>;
	onChange: (id: string, patch: Partial<WaveModel>) => void;
	onDelete: (id: string) => void;
};

export default function WavesList(props: WavesListProps) {
	return (
		<div class="flex flex-col gap-8">
			<For each={props.waves()}>
				{(w) => (
					<WaveRow
						wave={w}
						onChange={props.onChange}
						onDelete={props.onDelete}
					/>
				)}
			</For>
		</div>
	);
}
