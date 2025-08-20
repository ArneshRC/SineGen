import { type JSX, splitProps } from "solid-js";

type IconButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	tone?: "neutral" | "danger";
	size?: "md" | "sm";
	children: JSX.Element;
};

export default function IconButton(allProps: IconButtonProps) {
	const [props, rest] = splitProps(allProps, [
		"tone",
		"size",
		"class",
		"children",
	]);
	const tone =
		props.tone === "danger"
			? "border-base02 bg-base01 text-base08 hover:bg-base02/60"
			: "border-base02 bg-base01 text-base07 hover:bg-base02/60";
	const size = props.size === "sm" ? "w-8 h-8" : "w-9 h-9";

	return (
		<button
			{...rest}
			class={`flex justify-center items-center ${size} rounded-lg border transition active:translate-y-px ${tone} ${props.class ?? ""}`}
		>
			{props.children}
		</button>
	);
}
