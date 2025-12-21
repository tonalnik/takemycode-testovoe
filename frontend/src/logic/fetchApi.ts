interface UseApiProps<T> {
	url: string;
	parseResponse?: "json" | "text" | ((res: Response) => T | Promise<T>);
	init?: RequestInit;
	query?: Record<string, string>;
	onLoad?: (data: T) => void;
	onError?: (response: Response) => void;
	onFetchError?: (error: any) => void;
	onStart?: () => void;
	onFinally?: () => void;
}

const getUrlWithQuery = (url: string, query: Record<string, string> | undefined) => {
	if (!query || Object.keys(query).length === 0) return url;
	const concatChar = url.includes("?") ? "&" : "?";
	return `${url}${concatChar}${Object.entries(query)
		.map(([key, value]) => `${key}=${value}`)
		.join("&")}`;
};

async function fetchApi<T>(props: UseApiProps<T>) {
	const { url, init, query, parseResponse = "json", onLoad, onError, onFetchError, onStart, onFinally } = props;

	const urlWithQuery = getUrlWithQuery(url, query);
	let data: T;

	onStart?.();
	try {
		const res = await fetch(urlWithQuery, init);

		if (!res.ok) {
			onError?.(res);
			return;
		}

		switch (parseResponse) {
			case "json":
				data = (await res.json()) as T;
				break;
			case "text":
				data = (await res.text()) as T;
				break;
			default:
				data = (await parseResponse(res)) as T;
				break;
		}

		onLoad?.(data);
	} catch (error) {
		onFetchError?.(error);
	} finally {
		onFinally?.();
	}
}

export default fetchApi;
