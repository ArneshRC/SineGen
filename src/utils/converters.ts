export function rem2px(rem: number) {
	return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
