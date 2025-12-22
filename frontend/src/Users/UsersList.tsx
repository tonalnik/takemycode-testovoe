import type { User } from "@shared/SharedTypes";
import { useEffect, useRef } from "react";
import TotalUsers from "./TotalUsers";
import UserAtom from "./UserAtom";

interface UsersListProps {
	users: User[] | null;
	isLoading: boolean;
	totalUserCount: number | null;
	scrollTo?: number | null;
	userTitle?: string;
	onScrollEnd?: () => void;
	onScroll?: (scrollTop: number) => void;
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

const UsersList: React.FC<UsersListProps> = (props) => {
	const { users, isLoading, totalUserCount, onScrollEnd, onScroll, scrollTo, userTitle } = props;
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			const container = scrollContainerRef.current;
			if (!container) return;

			const { scrollTop, scrollHeight, clientHeight } = container;
			onScroll?.(scrollTop);

			const THRESHOLD = 100;

			if (scrollHeight - scrollTop - clientHeight < THRESHOLD && !isLoading) {
				onScrollEnd?.();
			}
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

	const isSkeleton = isLoading && users === null;
	const isEmpty = !isSkeleton && users && users.length === 0;

	const totalUsers = <TotalUsers usersCount={users?.length ?? null} totalUserCount={isEmpty ? 0 : totalUserCount} />;

	return (
		<div>
			{totalUsers}
			<div
				ref={scrollContainerRef}
				style={{
					height: "300px",
					width: "500px",
					backgroundColor: "#f0f0f0",
					overflowY: isSkeleton ? "hidden" : "scroll",
				}}
			>
				{isSkeleton && <UsersSkeleton />}
				{!isSkeleton && users?.map((user) => <UserAtom key={user.id} user={user} title={userTitle} />)}
				{isLoading && <div style={{ padding: "10px", textAlign: "center" }}>Загрузка...</div>}
			</div>
		</div>
	);
};

export default UsersList;
