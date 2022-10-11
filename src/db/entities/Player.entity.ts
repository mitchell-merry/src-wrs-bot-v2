import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { GuildEntity } from "./Guild.entity";

@Entity({ name: 'player' })
export class PlayerEntity {

	/** The guild this association is on. */
	@PrimaryColumn()
	guild_id!: string;

	/** The player's ID on speedrun.com. */
	@PrimaryColumn()
	player_id!: string;

	/** The player's ID on discord. */
	@Column()
	discord_id!: string;

	/** The username of the player's speedrun.com account. */
	@Column()
	src_name!: string;

	/** The guild the leaderboard is being tracked in. */
	@ManyToOne(() => GuildEntity, guild => guild.players, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'guild_id' })
	guild!: GuildEntity;
	
	constructor(guild_id: string, player_id: string, discord_id: string) {
		this.guild_id = guild_id;
		this.player_id = player_id;
		this.discord_id = discord_id;
	}
}