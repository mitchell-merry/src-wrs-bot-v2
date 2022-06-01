import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GuildEntity } from ".";

@Entity()
export class ModeratorRole {

	/** The ID of the guild the moderator role belongs to. */
	@PrimaryColumn()
	guild_id!: string;

	/** The ID of the role in the guild. */
	@PrimaryColumn()
	role_id!: string;

	/** The leaderboard which this variable is attached to. */
	@ManyToOne(() => GuildEntity, guild => guild.moderatorRoles)
	@JoinColumn({ name: 'guild_id' })
	guild!: GuildEntity;

	constructor(guild_id: string, role_id: string) {
		this.guild_id = guild_id;
		this.role_id = role_id;
	}
}