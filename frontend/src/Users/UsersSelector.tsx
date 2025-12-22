import { User, UserWithOrder } from "@shared/SharedTypes";
import { createContext, useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../hooks/useDebounce";
import { UPDATE_SELECTED_USERS_DELAY } from "../logic/consts";
import fetchApi from "../logic/fetchApi";
import onFetchError from "../logic/onFetchError";
import LeftListUsers from "./LeftListUsers/LeftListUsers";
import RightListUsers from "./RightListUsers/RightListUsers";

export const UsersSelectorContext = createContext<{
	selectedUsers: UserWithOrder[];
	initSelectedUsers: (users: UserWithOrder[]) => void;
	addUser: (user: User) => void;
	deleteUserById: (userId: number) => void;
	moveUser: (draggedOrder: number, targetOrder: number) => void;
}>({
	selectedUsers: [],
	initSelectedUsers: () => {},
	addUser: () => {},
	deleteUserById: () => {},
	moveUser: () => {},
});

const UsersSelector: React.FC = () => {
	const [selectedUsers, setSelectedUsers] = useState<UserWithOrder[]>([]);
	const [orderCounter, setOrderCounter] = useState(0);
	const [isGetSelectedUsersLoading, setIsGetSelectedUsersLoading] = useState(false);
	const isInitSelectedUsers = useRef<boolean | "changeOnNextRenderToFalse">(true);

	const updateSelectedUsers = useDebounce((selectedUsers: UserWithOrder[]) => {
		void fetchApi({
			url: "/api/update-users-order",
			init: {
				method: "POST",
				body: JSON.stringify(selectedUsers),
				headers: {
					"Content-Type": "application/json",
				},
			},
			onError: (response) => {
				console.error("Ошибка при обновлении пользователей:", response.statusText);
			},
			onFetchError,
		});
	}, UPDATE_SELECTED_USERS_DELAY);

	useEffect(() => {
		if (isInitSelectedUsers.current === true) return;
		if (isInitSelectedUsers.current === "changeOnNextRenderToFalse") {
			isInitSelectedUsers.current = false;
			return;
		}

		updateSelectedUsers(selectedUsers);
	}, [selectedUsers]);

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

	const initSelectedUsers = useCallback((users: UserWithOrder[]) => {
		setSelectedUsers(users);
	}, []);

	useEffect(() => {
		void fetchApi<UserWithOrder[]>({
			url: "/api/get-selected-users",
			parseResponse: "json",
			onStart: () => setIsGetSelectedUsersLoading(true),
			onFinally: () => {
				setIsGetSelectedUsersLoading(false);
				isInitSelectedUsers.current = "changeOnNextRenderToFalse";
			},
			onLoad: (data) => {
				initSelectedUsers(data);
			},
			onError: (response) => {
				console.error("Ошибка при загрузке пользователей:", response.statusText);
			},
			onFetchError,
		});
	}, []);

	return (
		<UsersSelectorContext.Provider value={{ selectedUsers, initSelectedUsers, addUser, deleteUserById, moveUser }}>
			<div style={{ display: "flex", width: "100%", gap: "1rem" }}>
				<LeftListUsers />
				<RightListUsers isLoading={isGetSelectedUsersLoading} />
			</div>
		</UsersSelectorContext.Provider>
	);
};

export default UsersSelector;
