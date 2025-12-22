import { User } from "@shared/SharedTypes";
import { useContext, useState } from "react";
import UsersList from "../UsersList";
import { UsersSelectorContext } from "../UsersSelector";

const RightListUsers: React.FC = () => {
	const { selectedUsers: users, setSelectedUsers } = useContext(UsersSelectorContext);
	const [filterUsers, setFilterUsers] = useState("");
	const userTitle = `Нажмите, чтобы удалить пользователя из списка выбранных`;

	const filteredUsers =
		filterUsers === "" ? users : users.filter((user) => user.id.toString().startsWith(filterUsers));

	const onUserClick = (user: User) => {
		const newSelectedUsers = users.filter((u) => u.id !== user.id);
		setSelectedUsers(newSelectedUsers);
	};

	return (
		<div>
			<span style={{ marginRight: "0.5rem" }}>Отфильтровать по ID</span>
			<input type="text" onChange={(e) => setFilterUsers(e.target.value)} placeholder="Введите ID" />
			<UsersList
				users={filteredUsers}
				isLoading={false}
				totalUserCount={users.length}
				userTitle={userTitle}
				onUserClick={onUserClick}
			/>
		</div>
	);
};

export default RightListUsers;
