import { User } from "@shared/SharedTypes";
import { createContext, useCallback, useState } from "react";
import LeftListUsers from "./LeftListUsers/LeftListUsers";
import RightListUsers from "./RightListUsers/RightListUsers";

export const UsersSelectorContext = createContext<{
	selectedUsers: User[];
	addUser: (user: User) => void;
	deleteUserById: (userId: number) => void;
}>({
	selectedUsers: [],
	addUser: () => {},
	deleteUserById: () => {},
});

const UsersSelector: React.FC = () => {
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

	const addUser = useCallback((user: User) => {
		setSelectedUsers((prev) => [...prev, user]);
	}, []);

	const deleteUserById = useCallback((userId: number) => {
		setSelectedUsers((prev) => prev.filter((selectedUser) => selectedUser.id !== userId));
	}, []);

	return (
		<UsersSelectorContext.Provider value={{ selectedUsers, addUser, deleteUserById }}>
			<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
				<LeftListUsers />
				<RightListUsers />
			</div>
		</UsersSelectorContext.Provider>
	);
};

export default UsersSelector;
