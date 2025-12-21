import { User } from "@shared/User";
import { useEffect, useRef, useState } from "react";

const PER_PAGE = 20;

const Users: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const currentPage = useRef(1);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const fetchUsers = async () => {
		if (isLoading) return;

		setIsLoading(true);
		try {
			const res = await fetch(`/api/get-users?page=${currentPage.current}&per_page=${PER_PAGE}`);
			if (!res.ok) return;

			const data = (await res.json()) as User[];

			if (data.length > 0) {
				setUsers((prev) => [...prev, ...data]);
				currentPage.current += 1;
			}
		} catch (error) {
			console.error("Ошибка при загрузке пользователей:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleScroll = () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const threshold = 100; // Загружать когда осталось 100px до конца

		if (scrollHeight - scrollTop - clientHeight < threshold && !isLoading) {
			fetchUsers();
		}
	};

	const fetchUsersByIdSubstring = async (idSubstring: string) => {
		if (isLoading || !idSubstring) return;

		setIsLoading(true);
		try {
			const res = await fetch(`/api/get-users-by-id-substring?id_substring=${idSubstring}&per_page=${PER_PAGE}`);
			if (!res.ok) return;

			const data = (await res.json()) as User[];
			setUsers(data);
			// currentPage.current += 1;
		} catch (error) {
			console.error("Ошибка при загрузке пользователей по подстроке в id:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchTotalUserCount = async () => {
		const res = await fetch(`/api/get-total-user-count`);
		if (!res.ok) return;

		const data = (await res.json()) as { count: number };
		setTotalUserCount(data.count);
	};

	useEffect(() => {
		fetchUsers();
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
			<input type="text" onChange={(e) => fetchUsersByIdSubstring(e.target.value as string)} />
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
