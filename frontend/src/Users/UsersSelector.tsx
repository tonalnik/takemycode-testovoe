import LeftListUsers from "./LeftListUsers/LeftListUsers";
import RightListUsers from "./RightListUsers/RightListUsers";

const UsersSelector: React.FC = () => {
	return (
		<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
			<LeftListUsers />
			<RightListUsers />
		</div>
	);
};

export default UsersSelector;
