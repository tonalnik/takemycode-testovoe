import type { User } from "@shared/SharedTypes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import TotalUsers from "./TotalUsers";
import UserAtom, { type DragItem, type UserWithOrder } from "./UserAtom";

interface UsersListProps {
	users: UserWithOrder[] | null;
	isLoading: boolean;
	totalUserCount: number | null;
	scrollTo?: number | null;
	userTitle?: string;
	onScrollEnd?: () => void;
	onScroll?: (scrollTop: number) => void;
	onUserClick?: (user: User) => void;
	draggable?: boolean;
	onDrop?: (draggedOrder: number, targetOrder: number) => void;
	listId?: string;
}

const UsersSkeleton = () => {
	return (
		<>
			{Array.from({ length: 10 }).map((_, idx) => (
				<div
					key={idx}
					style={{
						height: "24px",
						margin: "6px 0",
						background: "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)",
						backgroundSize: "200% 100%",
						animation: "skeleton-loading 1.2s ease-in-out infinite",
					}}
				/>
			))}
			<style>{`
				@keyframes skeleton-loading {
					0% { background-position: 200% 0; }
					100% { background-position: -200% 0; }
				}
			`}</style>
		</>
	);
};

const SCROLL_THRESHOLD = 100;

const UsersList: React.FC<UsersListProps> = (props) => {
	const {
		users,
		isLoading,
		totalUserCount,
		scrollTo,
		userTitle,
		onUserClick,
		onScrollEnd,
		onScroll,
		draggable = false,
		onDrop,
		listId,
	} = props;
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
	const sortedUsers = users ? [...users].sort((a, b) => a.order - b.order) : null;

	const onScrollContainerChange = (container: HTMLDivElement) => {
		const { scrollTop, scrollHeight, clientHeight } = container;

		if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
			onScrollEnd?.();
		}
	};

	useEffect(() => {
		if (!scrollContainerRef.current || !users || isLoading) return;

		const container = scrollContainerRef.current;
		onScrollContainerChange(container);
	}, [users, isLoading]);

	useEffect(() => {
		const handleScroll = () => {
			const container = scrollContainerRef.current;
			if (!container || isLoading) return;

			const { scrollTop } = container;
			onScroll?.(scrollTop);
			onScrollContainerChange(container);
		};

		const container = scrollContainerRef.current;
		if (!container) return;

		container.addEventListener("scroll", handleScroll);
		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [isLoading, onScrollEnd, onScroll]);

	useEffect(() => {
		if (scrollTo !== null && scrollTo !== undefined && scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = scrollTo;
		}
	}, [scrollTo]);

	const [{ isOver, draggedItem }, drop] = useDrop(
		() => ({
			accept: "user",
			canDrop: () => draggable,
			drop: (item: DragItem, monitor) => {
				if (!draggable || !sortedUsers) return;

				const clientOffset = monitor.getClientOffset();
				if (!clientOffset || !scrollContainerRef.current) return;

				const container = scrollContainerRef.current;
				const rect = container.getBoundingClientRect();
				const y = clientOffset.y - rect.top + container.scrollTop;
				const items = Array.from(container.children).filter((child) => child.querySelector(".user-atom"));

				let targetIndex = sortedUsers.length;
				for (let i = 0; i < items.length; i++) {
					const itemRect = items[i].getBoundingClientRect();
					const itemTop = itemRect.top - rect.top + container.scrollTop;
					if (y < itemTop + itemRect.height / 2) {
						targetIndex = i;
						break;
					}
					targetIndex = i + 1;
				}

				const draggedOrder = item.order;
				const targetOrder =
					targetIndex < sortedUsers.length
						? sortedUsers[targetIndex].order
						: sortedUsers.length > 0
						? sortedUsers[sortedUsers.length - 1].order + 1
						: 0;

				if (draggedOrder !== targetOrder) {
					onDrop?.(draggedOrder, targetOrder);
				}
				setDraggedOverIndex(null);
			},
			hover: (item: DragItem, monitor) => {
				if (!draggable || !sortedUsers) return;

				const clientOffset = monitor.getClientOffset();
				if (!clientOffset || !scrollContainerRef.current) return;

				const container = scrollContainerRef.current;
				const rect = container.getBoundingClientRect();
				const y = clientOffset.y - rect.top + container.scrollTop;
				const items = Array.from(container.children).filter((child) => child.querySelector(".user-atom"));

				let index = sortedUsers.length;
				for (let i = 0; i < items.length; i++) {
					const itemRect = items[i].getBoundingClientRect();
					const itemTop = itemRect.top - rect.top + container.scrollTop;
					if (y < itemTop + itemRect.height / 2) {
						index = i;
						break;
					}
					index = i + 1;
				}
				setDraggedOverIndex(index);
			},
			collect: (monitor) => ({
				isOver: monitor.isOver() && monitor.canDrop(),
				draggedItem: monitor.getItem() as DragItem | null,
			}),
		}),
		[draggable, sortedUsers, onDrop]
	);

	useEffect(() => {
		if (!isOver) {
			setDraggedOverIndex(null);
		}
	}, [isOver]);

	const isSkeleton = isLoading && users === null;
	const isEmpty = !isSkeleton && sortedUsers && sortedUsers.length === 0;

	const totalUsers = (
		<TotalUsers usersCount={sortedUsers?.length ?? null} totalUserCount={isEmpty ? 0 : totalUserCount} />
	);

	const dropRefCallback = useCallback(
		(node: HTMLDivElement | null) => {
			(scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
			drop(node);
		},
		[drop]
	);

	return (
		<div>
			{totalUsers}
			<div
				ref={dropRefCallback}
				data-list-id={listId}
				style={{
					height: "300px",
					width: "500px",
					backgroundColor: isOver ? "#e0e0e0" : "#f0f0f0",
					overflowY: isSkeleton ? "hidden" : "scroll",
					position: "relative",
					transition: "background-color 0.2s",
				}}
			>
				{isSkeleton && <UsersSkeleton />}
				{!isSkeleton &&
					sortedUsers?.map((user, index) => (
						<div key={`${user.id}-${user.order}`} style={{ position: "relative" }}>
							{draggedOverIndex === index &&
								isOver &&
								draggedItem &&
								draggedItem.order !== user.order && (
									<div
										style={{
											position: "absolute",
											top: 0,
											left: 0,
											right: 0,
											height: "2px",
											backgroundColor: "#007bff",
											zIndex: 10,
										}}
									/>
								)}
							<UserAtom
								user={user}
								title={userTitle}
								onClick={() => onUserClick?.(user)}
								draggable={draggable}
							/>
						</div>
					))}
				{draggedOverIndex === (sortedUsers?.length ?? 0) && isOver && draggedItem && (
					<div
						style={{
							height: "2px",
							backgroundColor: "#007bff",
							marginTop: "4px",
						}}
					/>
				)}
				{isLoading && <div style={{ padding: "10px", textAlign: "center" }}>Загрузка...</div>}
			</div>
		</div>
	);
};

export default UsersList;
