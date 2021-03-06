import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: 'player' })
export class PlayerEntity {

	/** The player's ID on speedrun.com. */
	@PrimaryColumn()
	player_id!: string;

	/** The player's ID on discord. */
	@Column()
	discord_id!: string;

	/** The username of the player's speedrun.com account. */
	@Column()
	src_name!: string;
	
	constructor(player_id: string, discord_id: string) {
		this.player_id = player_id;
		this.discord_id = discord_id;
	}
}