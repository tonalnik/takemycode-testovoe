import type { User } from "@shared/SharedTypes";

interface UserAtomProps {
	user: User;
	title?: string;
}

const UserAtom = (props: UserAtomProps) => {
	const { user, title } = props;

	return (
		<div className="user-atom" title={title}>
			{user.id} {user.name} {user.email}
			<style>
				{`
                    .user-atom {
                        cursor: pointer;
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
