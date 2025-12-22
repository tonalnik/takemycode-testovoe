import { User } from "@shared/SharedTypes";
import { useContext, useMemo } from "react";
import { UsersSelectorContext } from "../Users/UsersSelector";

const useGetUsersWithoutSelected = (
	users: User[] | null,
	totalUsersCount: number | null
): {
	usersWithoutSelected: User[] | null;
	totalUsersCountWithoutSelected: number | null;
} => {
	const { selectedUsers } = useContext(UsersSelectorContext);

	const usersWithoutSelected = useMemo(() => {
		if (!users) return null;
		if (!users.length) return [];
		if (!selectedUsers.length) return users;
		return users.filter((user) => !selectedUsers.map((selectedUser) => selectedUser.id).includes(user.id));
	}, [users, selectedUsers]);

	const filtered = users && usersWithoutSelected ? users.length - usersWithoutSelected.length : 0;

	const getTotalUsersCountWithoutSelected = (): number | null => {
		if (!totalUsersCount) return null;
		if (filtered === 0) return totalUsersCount;
		const totalUsersCountWithoutSelected = totalUsersCount - filtered;
		if (totalUsersCountWithoutSelected <= 0) return 0;
		return totalUsersCountWithoutSelected;
	};

	return {
		usersWithoutSelected,
		totalUsersCountWithoutSelected: getTotalUsersCountWithoutSelected(),
	};
};

export default useGetUsersWithoutSelected;
