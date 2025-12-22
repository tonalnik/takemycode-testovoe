import { User } from "@shared/SharedTypes";
import { useContext, useState } from "react";
import { UsersSelectorContext } from "../UsersSelector";
import UsersWithFilter from "./UsersWithFilter";
import UsersWithoutFilter from "./UsersWithoutFilter";

const Users: React.FC = () => {
	const { addUser } = useContext(UsersSelectorContext);

	const [filterUsers, setFilterUsers] = useState("");
	const userTitle = `Нажмите, чтобы добавить пользователя в список выбранных`;

	const onUserClick = (user: User) => {
		addUser(user);
	};

	return (
		<div>
			<span style={{ marginRight: "0.5rem" }}>Отфильтровать по ID</span>
			<input type="text" onChange={(e) => setFilterUsers(e.target.value)} placeholder="Введите ID" />
			<UsersWithFilter
				key={filterUsers}
				filterUser={filterUsers}
				show={!!filterUsers}
				userTitle={userTitle}
				onUserClick={onUserClick}
			/>
			<UsersWithoutFilter show={!filterUsers} userTitle={userTitle} onUserClick={onUserClick} />
		</div>
	);
};

export default Users;
