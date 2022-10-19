import { AutocompleteInteraction } from "discord.js";

export type Autocompleter = (interaction: AutocompleteInteraction) => Promise<void>; 