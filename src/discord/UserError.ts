export default class UserError extends Error {
	constructor(message: any) {
		super(message);
		this.name = "UserError";
	}
}