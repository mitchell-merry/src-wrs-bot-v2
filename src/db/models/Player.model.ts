import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Player {

	/** The player's ID on speedrun.com. */
	@PrimaryColumn()
	player_id!: string;

	/** The player's ID on discord. */
	@Column()
	discord_id!: string;
}