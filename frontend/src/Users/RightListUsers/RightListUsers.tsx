import { User } from "@shared/SharedTypes";
import { useContext, useMemo, useState } from "react";
import UsersList from "../UsersList";
import { UsersSelectorContext } from "../UsersSelector";

const RightListUsers: React.FC = () => {
	const { selectedUsers: users, deleteUserById, moveUser } = useContext(UsersSelectorContext);
	const [filterUsers, setFilterUsers] = useState("");
	const userTitle = `Нажмите, чтобы удалить пользователя из списка выбранных`;

	const filteredUsers = useMemo(() => {
		const filtered =
			filterUsers === "" ? users : users.filter((user) => user.id.toString().startsWith(filterUsers));
		return filtered;
	}, [users, filterUsers]);

	const onUserClick = (user: User) => {
		deleteUserById(user.id);
	};

	const handleDrop = (draggedOrder: number, targetOrder: number) => {
		moveUser(draggedOrder, targetOrder);
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
				draggable={true}
				onDrop={handleDrop}
				listId="right-list"
			/>
		</div>
	);
};

export default RightListUsers;
