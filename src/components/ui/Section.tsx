import type { ParentProps } from "solid-js";

export default function Section(props: ParentProps) {
	return (
		<section class="w-full max-w-8xl pb-16 lg:px-6">{props.children}</section>
	);
}
