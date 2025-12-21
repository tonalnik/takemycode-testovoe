export interface User {
	id: number;
	name: string;
	email: string;
	age: number;
	city: string;
	phone: string;
	created_at: string;
	updated_at: string;
}

export interface UsersData {
	users: User[];
	totalUserCount: number;
}
