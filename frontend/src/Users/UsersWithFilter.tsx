import type { User, UsersData } from "@shared/SharedTypes";
import { useEffect, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { DEBOUNCE_DELAY, PER_PAGE } from "../logic/consts";
import fetchApi from "../logic/fetchApi";
import onFetchError from "../logic/onFetchError";
import TotalUsers from "./TotalUsers";
import UsersAtom from "./UsersList";

interface UserWithFilter {
	show: boolean;
	filterUser: string;
}

const UsersWithFilter: React.FC<UserWithFilter> = (props) => {
	const { show, filterUser } = props;
	const [users, setUsers] = useState<User[]>([]);
	const [totalUserCount, setTotalUserCount] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(true);
	const currentPage = useRef(1);

	const debouncedFetchUsersByIdSubstring = useDebounce(() => {
		if (!filterUser) return;
		if (totalUserCount === users.length) return;

		fetchApi<UsersData>({
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
				setUsers((prev) => [...prev, ...data.users]);
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
		<div>
			<TotalUsers usersCount={users.length} totalUserCount={totalUserCount} />
			<UsersAtom
				users={users}
				isLoading={isLoading}
				onScrollEnd={debouncedFetchUsersByIdSubstring}
				userTitle={`Нажмите, чтобы добавить пользователя в список выбранных`}
			/>
		</div>
	);
};

export default UsersWithFilter;
