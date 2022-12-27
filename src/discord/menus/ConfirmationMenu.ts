import { ButtonStyle } from "discord.js";
import DialogueMenu from "./DialogueMenu";

export default class ConfirmationMenu extends DialogueMenu<"YES" | "NO"> {
	constructor(message: string, yes: string = "Yes", no: string = "No") {
		super(message, [{
			id: "YES",
			label: yes,
			style: ButtonStyle.Success,
		}, {
			id: "NO",
			label: no,
			style: ButtonStyle.Danger,
		}]);
	}
}