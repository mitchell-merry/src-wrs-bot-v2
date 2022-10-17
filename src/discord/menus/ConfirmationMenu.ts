import DialogueMenu from "./DialogueMenu";

export default class ConfirmationMenu extends DialogueMenu {
	constructor(message: string, yes: string = "Yes", no: string = "No") {
		super(message, [{
			id: "YES",
			label: yes,
			style: "SUCCESS",
		}, {
			id: "NO",
			label: no,
			style: "DANGER",	
		}]);
	}
}