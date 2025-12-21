import type { User, UsersData } from "@shared/SharedTypes";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PER_PAGE } from "../logic/consts";
import fetchApi from "../logic/fetchApi";
import onFetchError from "../logic/onFetchError";
import TotalUsers from "./TotalUsers";
import UsersAtom from "./UsersList";

interface UsersWithoutFilterProps {
	show: boolean;
}
const UsersWithoutFilter: React.FC<UsersWithoutFilterProps> = (props) => {
	const { show } = props;
	const [users, setUsers] = useState<User[]>([]);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const currentPage = useRef(1);
	const scrollTop = useRef(0);
	const [scrollTo, setScrollTo] = useState<number | null>(null);

	const onScroll = useCallback((scrollTopValue: number) => {
		scrollTop.current = scrollTopValue;
	}, []);

	const fetchAllUsers = useCallback(() => {
		if (isLoading) return;
		if (totalUserCount === users.length) return;

		fetchApi<UsersData>({
			url: "/api/get-users",
			query: {
				page: currentPage.current.toString(),
				per_page: PER_PAGE.toString(),
			},
			parseResponse: "json",
			onStart: () => setIsLoading(true),
			onFinally: () => setIsLoading(false),
			onLoad: (data) => {
				setTotalUserCount(data.totalUserCount);
				setUsers((prev) => [...prev, ...data.users]);
				currentPage.current += 1;
			},
			onError: (response) => {
				console.error("Ошибка при загрузке пользователей:", response.statusText);
			},
			onFetchError,
		});
	}, [isLoading]);

	useEffect(() => {
		fetchAllUsers();
	}, []);

	useLayoutEffect(() => {
		if (!show) return;
		if (scrollTop.current > 0) setScrollTo(scrollTop.current);
	}, [show]);

	if (!show) return null;

	return (
		<div>
			<TotalUsers usersCount={users.length} totalUserCount={totalUserCount} />
			<UsersAtom
				users={users}
				isLoading={isLoading}
				onScrollEnd={fetchAllUsers}
				onScroll={onScroll}
				scrollTo={scrollTo}
				userTitle={`Нажмите, чтобы добавить пользователя в список выбранных`}
			/>
		</div>
	);
};

export default UsersWithoutFilter;
