import type { User } from "@shared/SharedTypes";

interface UserAtomProps {
	user: User;
	title?: string;
	onClick?: () => void;
}

const UserAtom = (props: UserAtomProps) => {
	const { user, title, onClick } = props;

	return (
		<div className="user-atom" title={title} onClick={onClick}>
			{user.id} {user.name} {user.email}
			<style>
				{`
                    .user-atom {
                        cursor: pointer;
						font-size: 20px;
                    }
                    .user-atom:hover {
                        font-weight: bold;
                    }
                    
                    }
                `}
			</style>
		</div>
	);
};

export default UserAtom;
