interface TotalUsersProps {
	usersCount: number;
	totalUserCount: number | null;
}

const TotalUsers: React.FC<TotalUsersProps> = (props) => {
	const { usersCount, totalUserCount } = props;
	return (
		<div>Всего пользователей: {totalUserCount === null ? "Загрузка..." : `${usersCount} / ${totalUserCount}`}</div>
	);
};

export default TotalUsers;
