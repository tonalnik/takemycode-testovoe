import { useLayoutEffect, useMemo, useRef } from "react";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;
	return function (...args: Parameters<T>) {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => func(...args), delay);
	};
}

function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): (...args: Parameters<T>) => void {
	const callbackRef = useRef(callback);

	useLayoutEffect(() => {
		callbackRef.current = callback;
	});

	return useMemo(() => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay), [delay]);
}

export default useDebounce;
