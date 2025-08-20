import type { ParentProps } from "solid-js";
import { TbWaveSine } from "solid-icons/tb";

export default function Heading(props: ParentProps) {
	return (
		<h1 class="text-2xl font-semibold tracking-tight inline-flex gap-2 items-center">
			<TbWaveSine /> {props.children}
		</h1>
	);
}
