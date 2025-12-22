import type { User, UsersData, UserWithOrder } from "@shared/SharedTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import useDebounce from "../../hooks/useDebounce";
import useGetUsersWithoutSelected from "../../hooks/useGetUsersWithoutSelected";
import { DEBOUNCE_DELAY, PER_PAGE } from "../../logic/consts";
import fetchApi from "../../logic/fetchApi";
import onFetchError from "../../logic/onFetchError";
import UsersList from "../UsersList";

interface UserWithFilter {
	show: boolean;
	filterUser: string;
	userTitle?: string;
	onUserClick?: (user: User) => void;
}

const UsersWithFilter: React.FC<UserWithFilter> = (props) => {
	const { show, filterUser, userTitle, onUserClick } = props;
	const [users, setUsers] = useState<User[] | null>(null);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const { usersWithoutSelected, totalUsersCountWithoutSelected } = useGetUsersWithoutSelected(users, totalUserCount);

	const usersWithOrder = useMemo(() => {
		if (!usersWithoutSelected) return null;
		return usersWithoutSelected.map((user, index) => ({ ...user, order: index })) as UserWithOrder[];
	}, [usersWithoutSelected]);

	const [isLoading, setIsLoading] = useState(true);
	const currentPage = useRef(1);

	const debouncedFetchUsersByIdSubstring = useDebounce(() => {
		if (!filterUser) return;
		if (totalUserCount === users?.length) return;

		void fetchApi<UsersData>({
			url: "/api/get-users-by-id-substring",
			query: {
				id_substring: filterUser,
				per_page: PER_PAGE.toString(),
				page: currentPage.current.toString(),
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
				console.error("Ошибка при загрузке пользователей по подстроке в id:", response.statusText);
			},
			onFetchError,
		});
	}, DEBOUNCE_DELAY);

	useEffect(() => {
		if (!filterUser) return;
		debouncedFetchUsersByIdSubstring();
	}, []);

	if (!show) return null;

	return (
		<UsersList
			users={usersWithOrder}
			totalUserCount={totalUsersCountWithoutSelected}
			isLoading={isLoading}
			onScrollEnd={debouncedFetchUsersByIdSubstring}
			userTitle={userTitle}
			onUserClick={onUserClick}
		/>
	);
};

export default UsersWithFilter;
