import { User } from "@shared/SharedTypes";
import { useState } from "react";
import UsersList from "../UsersList";

const RightListUsers: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [filterUsers, setFilterUsers] = useState("");
	const isEmpty = users.length === 0;

	return (
		<div>
			<span style={{ marginRight: "0.5rem" }}>Отфильтровать по ID</span>
			<input type="text" onChange={(e) => setFilterUsers(e.target.value)} placeholder="Введите ID" />
			<UsersList users={users} isLoading={false} totalUserCount={isEmpty ? 0 : null} />
		</div>
	);
};

export default RightListUsers;
