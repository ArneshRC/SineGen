import { type Accessor } from "solid-js";
import {
	TbPlayerPlayFilled,
	TbPlayerPauseFilled,
	TbPlus,
} from "solid-icons/tb";
import Button from "./ui/Button";
import Heading from "./ui/Heading";

type HeaderProps = {
	playing: Accessor<boolean>;
	onTogglePlay: () => void;
	onAddWave: () => void;
};

export default function Header(props: HeaderProps) {
	return (
		<header class="min-h-[56px] w-full pt-4 pb-6">
			<div class="w-full flex justify-between items-center mb-6 lg:px-6">
				<div class="z-40">
					<Heading>SineGen</Heading>
				</div>

				<div class="z-40 flex items-center gap-3 text-center">
					<Button
						variant="secondary"
						onClick={props.onTogglePlay}
						icon={
							props.playing() ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />
						}
					>
						<span class="hidden sm:inline ml-2">
							{props.playing() ? "Pause" : "Play"}
						</span>
					</Button>

					<Button variant="primary" onClick={props.onAddWave} icon={<TbPlus />}>
						<span class="hidden sm:inline ml-2">Add Wave</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
