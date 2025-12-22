import type { User, UsersData } from "@shared/SharedTypes";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import useGetUsersWithoutSelected from "../../hooks/useGetUsersWithoutSelected";
import { PER_PAGE } from "../../logic/consts";
import fetchApi from "../../logic/fetchApi";
import onFetchError from "../../logic/onFetchError";
import UsersList from "../UsersList";

interface UsersWithoutFilterProps {
	show: boolean;
	userTitle?: string;
	onUserClick?: (user: User) => void;
}
const UsersWithoutFilter: React.FC<UsersWithoutFilterProps> = (props) => {
	const { show, userTitle, onUserClick } = props;
	const [users, setUsers] = useState<User[] | null>(null);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const { usersWithoutSelected, totalUsersCountWithoutSelected } = useGetUsersWithoutSelected(users, totalUserCount);

	const [isLoading, setIsLoading] = useState(false);
	const currentPage = useRef(1);
	const scrollTop = useRef(0);
	const [scrollTo, setScrollTo] = useState<number | null>(null);

	const onScroll = useCallback((scrollTopValue: number) => {
		scrollTop.current = scrollTopValue;
	}, []);

	const fetchAllUsers = useCallback(() => {
		if (isLoading) return;
		if (totalUserCount === users?.length) return;

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
				setUsers((prev) => (prev ? [...prev, ...data.users] : data.users));
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
		<UsersList
			users={usersWithoutSelected}
			totalUserCount={totalUsersCountWithoutSelected}
			isLoading={isLoading}
			onScrollEnd={fetchAllUsers}
			onScroll={onScroll}
			scrollTo={scrollTo}
			userTitle={userTitle}
			onUserClick={onUserClick}
		/>
	);
};

export default UsersWithoutFilter;
