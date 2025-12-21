import { Count, User } from "@shared/SharedTypes";
import { useEffect, useRef, useState } from "react";
import useDebounce from "./hooks/useDebounce";
import fetchApi from "./logic/fetchApi";

const PER_PAGE = 20;
let DEBOUNCE_DELAY = 200;

const Users: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const currentPage = useRef(1);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const onFetchError = (error: any) => {
		console.error("Ошибка при загрузке пользователей:", error);
	};

	const fetchAllUsers = async () => {
		if (isLoading) return;
		fetchApi<User[]>({
			url: "/api/get-users",
			query: {
				page: currentPage.current.toString(),
				per_page: PER_PAGE.toString(),
			},
			parseResponse: "json",
			onStart: () => setIsLoading(true),
			onFinally: () => setIsLoading(false),
			onLoad: (data) => {
				setUsers((prev) => [...prev, ...data]);
				currentPage.current += 1;
			},
			onError: (response) => {
				console.error("Ошибка при загрузке пользователей:", response.statusText);
			},
			onFetchError,
		});
	};

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const threshold = 100;

		if (scrollHeight - scrollTop - clientHeight < threshold && !isLoading) {
			fetchAllUsers();
		}
	};

	const debouncedFetchUsersByIdSubstring = useDebounce((idSubstring: string) => {
		if (!idSubstring) return;

		fetchApi<User[]>({
			url: "/api/get-users-by-id-substring",
			query: {
				id_substring: idSubstring,
				per_page: PER_PAGE.toString(),
			},
			parseResponse: "json",
			onStart: () => setIsLoading(true),
			onFinally: () => setIsLoading(false),
			onLoad: (data) => {
				setUsers(data);
			},
			onError: (response) => {
				console.error("Ошибка при загрузке пользователей по подстроке в id:", response.statusText);
			},
			onFetchError,
		});
	}, DEBOUNCE_DELAY);

	const fetchTotalUserCount = async () => {
		fetchApi<Count>({
			url: "/api/get-total-user-count",
			parseResponse: "json",
			onLoad: (data) => {
				setTotalUserCount(data.count);
			},
			onError: (response) => {
				console.error("Ошибка при загрузке общего количества пользователей:", response.statusText);
			},
			onFetchError,
		});
	};

	useEffect(() => {
		fetchAllUsers();
		fetchTotalUserCount();
	}, []);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		container.addEventListener("scroll", handleScroll);
		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [isLoading]);

	return (
		<div>
			<div>Total users: {totalUserCount === null ? "Загрузка..." : totalUserCount}</div>
			<input type="text" onChange={(e) => debouncedFetchUsersByIdSubstring(e.target.value)} />
			<div
				ref={scrollContainerRef}
				style={{ maxHeight: "300px", width: "500px", backgroundColor: "#f0f0f0", overflowY: "scroll" }}
			>
				{users.map((user) => (
					<div key={user.id}>
						{user.id} {user.name} {user.email}
					</div>
				))}
				{isLoading && <div style={{ padding: "10px", textAlign: "center" }}>Загрузка...</div>}
			</div>
		</div>
	);
};

export default Users;
