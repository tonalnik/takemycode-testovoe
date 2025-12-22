import type { User } from "@shared/SharedTypes";
import { useDrag } from "react-dnd";
import DragHandleIcon from "./DragHandleIcon";

export interface UserWithOrder extends User {
	order: number;
}

export interface DragItem {
	type: string;
	order: number;
	user: UserWithOrder;
}

interface DragHandleProps {
	user: UserWithOrder;
	draggable: boolean;
}

const DragHandle = ({ user, draggable }: DragHandleProps) => {
	const [{ isDragging }, drag] = useDrag(
		() => ({
			type: "user",
			item: { type: "user", order: user.order, user } as DragItem,
			canDrag: draggable,
			collect: (monitor) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[draggable, user]
	);

	if (!draggable) return null;

	return (
		<div
			ref={drag}
			className="drag-handle"
			style={{
				display: "inline-flex",
				alignItems: "center",
				marginRight: "8px",
				cursor: isDragging ? "grabbing" : "grab",
				opacity: isDragging ? 0.5 : 1,
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<DragHandleIcon />
			<style>
				{`
					.drag-handle {
						color: #666;
						user-select: none;
					}
					.drag-handle:hover {
						color: #333;
					}
				`}
			</style>
		</div>
	);
};

interface UserAtomProps {
	user: UserWithOrder;
	title?: string;
	onClick?: () => void;
	draggable?: boolean;
}

const UserAtom = (props: UserAtomProps) => {
	const { user, title, onClick, draggable = false } = props;

	return (
		<div className="user-atom" title={title} onClick={onClick} style={{ display: "flex", alignItems: "center" }}>
			<DragHandle user={user} draggable={draggable} />
			<span>
				{user.id} {user.name} {user.email}
			</span>
			<style>
				{`
                    .user-atom {
                        cursor: pointer;
						font-size: 20px;
						padding: 4px;
						margin: 2px 0;
						transition: opacity 0.2s;
                    }
                    .user-atom:hover {
                        font-weight: bold;
                    }
                `}
			</style>
		</div>
	);
};

export default UserAtom;
