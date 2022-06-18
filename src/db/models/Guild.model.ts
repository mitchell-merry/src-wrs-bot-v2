import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TrackedLeaderboardEntity, ModeratorRoleEntity } from './';

@Entity({ name: 'guild' })
export class GuildEntity {

	/** The discord guild's ID. */
	@PrimaryColumn()
	guild_id!: string;

	/** The default colour to give to newly created roles. */
	@Column({ default: '#FEE75C' })
	role_default_colour!: string;

	/** The ID of the role to place new roles above. */
	@Column({ default: '' })
	above_role_id!: string;

	/** The leaderboards this guild is tracking. */
	@OneToMany(() => TrackedLeaderboardEntity, tlb => tlb.leaderboard)
	trackedLeaderboards!: TrackedLeaderboardEntity[];

	/** The moderator roles of this guild. */
	@OneToMany(() => ModeratorRoleEntity, modrole => modrole.guild)
	moderatorRoles!: ModeratorRoleEntity[];

	constructor(guild_id: string) {
		this.guild_id = guild_id;
	}
}