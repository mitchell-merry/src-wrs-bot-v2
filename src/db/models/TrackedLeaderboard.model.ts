import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { GuildEntity, LeaderboardEntity } from "./";

@Entity({ name: 'tracked_leaderboard' })
export class TrackedLeaderboardEntity {

	/** The ID of the associated Guild. */
	@PrimaryColumn()
	guild_id!: string;

	/** The ID of the associated Leaderboard. */
	@PrimaryColumn()
	lb_id!: number;

	/** The ID of the role associated with the leaderboard in the discord. */
	@Column({ default: '' })
	role_id!: string;

	/** The guild the leaderboard is being tracked in. */
	@ManyToOne(() => GuildEntity, guild => guild.trackedLeaderboards)
	@JoinColumn({ name: 'guild_id' })
	guild!: GuildEntity;

	/** The leaderboard being tracked. */
	@ManyToOne(() => LeaderboardEntity, leaderboard => leaderboard.trackedLeaderboards)
	@JoinColumn({ name: 'lb_id' })
	leaderboard!: LeaderboardEntity;

	constructor(guild_id: string, lb_id: number, role_id: string) {
		this.guild_id = guild_id;
		this.lb_id = lb_id;
		this.role_id = role_id;
	}
}