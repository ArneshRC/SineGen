import type { ParentProps } from "solid-js";

export function Card(props: ParentProps) {
	return (
		<div class="mx-auto rounded-2xl border shadow-sm border-base02/60">
			{props.children}
		</div>
	);
}

export function CardHeader(props: ParentProps) {
	return (
		<div class="flex gap-4 justify-between items-center py-4 px-5 border-b border-base02/60">
			{props.children}
		</div>
	);
}

export function CardBody(props: ParentProps) {
	return <div class="flex flex-col gap-4 p-5">{props.children}</div>;
}

export function CardFooter(props: ParentProps) {
	return (
		<div class="py-4 px-5 text-center border-t border-base02/60">
			{props.children}
		</div>
	);
}
