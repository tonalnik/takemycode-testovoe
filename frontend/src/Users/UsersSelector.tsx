import { User } from "@shared/SharedTypes";
import { createContext, useCallback, useState } from "react";
import LeftListUsers from "./LeftListUsers/LeftListUsers";
import RightListUsers from "./RightListUsers/RightListUsers";
import { UserWithOrder } from "./UserAtom";

export const UsersSelectorContext = createContext<{
	selectedUsers: UserWithOrder[];
	addUser: (user: User) => void;
	deleteUserById: (userId: number) => void;
	moveUser: (draggedOrder: number, targetOrder: number) => void;
}>({
	selectedUsers: [],
	addUser: () => {},
	deleteUserById: () => {},
	moveUser: () => {},
});

const UsersSelector: React.FC = () => {
	const [selectedUsers, setSelectedUsers] = useState<UserWithOrder[]>([]);
	const [orderCounter, setOrderCounter] = useState(0);

	const addUser = useCallback(
		(user: User) => {
			setSelectedUsers((prev) => {
				const newOrder = orderCounter;
				setOrderCounter((counter) => counter + 1);
				return [...prev, { ...user, order: newOrder }];
			});
		},
		[orderCounter]
	);

	const deleteUserById = useCallback((userId: number) => {
		setSelectedUsers((prev) => prev.filter((selectedUser) => selectedUser.id !== userId));
	}, []);

	const moveUser = useCallback((draggedOrder: number, targetOrder: number) => {
		setSelectedUsers((prev) => {
			const sorted = [...prev].sort((a, b) => a.order - b.order);
			const draggedIndex = sorted.findIndex((u) => u.order === draggedOrder);

			if (draggedIndex === -1) return prev;

			const draggedUser = sorted[draggedIndex];
			const withoutDragged = sorted.filter((u) => u.order !== draggedOrder);

			let targetIndex = withoutDragged.findIndex((u) => u.order >= targetOrder);
			if (targetIndex === -1) targetIndex = withoutDragged.length;

			const newUsers = [...withoutDragged];
			newUsers.splice(targetIndex, 0, draggedUser);

			return newUsers.map((user, index) => ({
				...user,
				order: index,
			}));
		});
	}, []);

	return (
		<UsersSelectorContext.Provider value={{ selectedUsers, addUser, deleteUserById, moveUser }}>
			<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
				<LeftListUsers />
				<RightListUsers />
			</div>
		</UsersSelectorContext.Provider>
	);
};

export default UsersSelector;
