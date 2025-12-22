import { UserWithOrder } from "@shared/SharedTypes.js";

export default class SelectedUsers {
	private _selectedUsers: Record<string, UserWithOrder[]> = {};

	constructor() {
		this._selectedUsers = {};
	}

	public saveUsers(author: string, users: UserWithOrder[]) {
		this._selectedUsers[author] = users;
	}

	public getUsers(author: string): UserWithOrder[] {
		return this._selectedUsers[author] ?? [];
	}
}
