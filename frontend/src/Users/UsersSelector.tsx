import { User } from "@shared/SharedTypes";
import { createContext, useState } from "react";
import LeftListUsers from "./LeftListUsers/LeftListUsers";
import RightListUsers from "./RightListUsers/RightListUsers";

export const UsersSelectorContext = createContext<{
	selectedUsers: User[];
	setSelectedUsers: (users: User[]) => void;
}>({
	selectedUsers: [],
	setSelectedUsers: () => {},
});

const UsersSelector: React.FC = () => {
	const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

	return (
		<UsersSelectorContext.Provider value={{ selectedUsers, setSelectedUsers }}>
			<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
				<LeftListUsers />
				<RightListUsers />
			</div>
		</UsersSelectorContext.Provider>
	);
};

export default UsersSelector;
