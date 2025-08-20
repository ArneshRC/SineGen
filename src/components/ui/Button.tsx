import { splitProps, type JSX } from "solid-js";

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary";
	icon?: JSX.Element;
};

export default function Button(allProps: ButtonProps) {
	const [props, rest] = splitProps(allProps, [
		"variant",
		"icon",
		"children",
		"class",
	]);
	const base =
		"flex items-center justify-center sm:py-2 sm:px-4 rounded-lg transition active:translate-y-px w-10 h-10 sm:w-auto sm:h-auto";
	const styles =
		props.variant === "primary"
			? "font-medium bg-base0D/90 text-base07 hover:bg-base0D"
			: "border group border-base02 bg-base00 text-base07 hover:bg-base02/50";

	return (
		<button {...rest} class={`${base} ${styles} ${props.class ?? ""}`}>
			{props.icon}
			<span class="font-medium">{props.children}</span>
		</button>
	);
}
