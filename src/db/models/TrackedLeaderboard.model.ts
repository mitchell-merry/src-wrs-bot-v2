import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { GuildEntity, Leaderboard } from "./";

@Entity()
export class TrackedLeaderboard {

	/** The ID of the associated Guild. */
	@PrimaryColumn()
	guild_id!: string;

	/** The ID of the associated Leaderboard. */
	@PrimaryColumn()
	lb_id!: number;

	/** The guild the leaderboard is being tracked in. */
	@ManyToOne(() => GuildEntity, guild => guild.trackedLeaderboards)
	@JoinColumn({ name: 'guild_id' })
	guild!: GuildEntity;

	/** The leaderboard being tracked. */
	@ManyToOne(() => Leaderboard, leaderboard => leaderboard.trackedLeaderboards)
	@JoinColumn({ name: 'lb_id' })
	leaderboard!: Leaderboard;

	/** The ID of the role associated with the leaderboard in the discord. */
	@Column()
	role_id!: string;
}