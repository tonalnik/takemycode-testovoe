import Users from "./Users";

const UsersSelector: React.FC = () => {
	return (
		<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
			<Users />
			<Users />
		</div>
	);
};

export default UsersSelector;
