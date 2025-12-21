import { useState } from "react";
import UsersWithFilter from "./UsersWithFilter";
import UsersWithoutFilter from "./UsersWithoutFilter";

const Users: React.FC = () => {
	const [filterUsers, setFilterUsers] = useState("");

	return (
		<div>
			<input type="text" onChange={(e) => setFilterUsers(e.target.value)} />
			<UsersWithFilter key={filterUsers} filterUser={filterUsers} show={!!filterUsers} />
			<UsersWithoutFilter show={!filterUsers} />
		</div>
	);
};

export default Users;
