import { User } from "@shared/SharedTypes";
import { useEffect, useRef } from "react";

interface UsersAtomProps {
	users: User[];
	isLoading: boolean;
	onScrollEnd?: () => void;
	onScroll?: (scrollTop: number) => void;
	scrollTo?: number | null;
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

const UsersAtom = (props: UsersAtomProps) => {
	const { users, isLoading, onScrollEnd, onScroll, scrollTo } = props;
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			const container = scrollContainerRef.current;
			if (!container) return;

			const { scrollTop, scrollHeight, clientHeight } = container;
			const THRESHOLD = 100;

			if (scrollHeight - scrollTop - clientHeight < THRESHOLD && !isLoading) {
				onScrollEnd?.();
			}

			// Вызываем callback для передачи текущей позиции скролла родителю
			onScroll?.(scrollTop);
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

	const isSkeleton = isLoading && users.length === 0;

	return (
		<div
			ref={scrollContainerRef}
			style={{
				maxHeight: "300px",
				width: "500px",
				backgroundColor: "#f0f0f0",
				overflowY: isSkeleton ? "hidden" : "scroll",
			}}
		>
			{isSkeleton && <UsersSkeleton />}
			{!isSkeleton &&
				users?.map((user) => (
					<div key={user.id}>
						{user.id} {user.name} {user.email}
					</div>
				))}
			{isLoading && <div style={{ padding: "10px", textAlign: "center" }}>Загрузка...</div>}
		</div>
	);
};

export default UsersAtom;
