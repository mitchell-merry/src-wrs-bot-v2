import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Guild, Leaderboard } from "./";

@Entity()
export class TrackedLeaderboard {

	/** The unique tracked leaderboard ID - auto-generated. Useless. */
	@PrimaryGeneratedColumn()
	tlb_id!: number;

	/** The guild the leaderboard is being tracked in. */
	@ManyToOne(() => Guild, guild => guild.trackedLeaderboards)
	@JoinColumn({ name: 'guild_id' })
	guild!: Guild;

	/** The leaderboard being tracked. */
	@ManyToOne(() => Leaderboard, leaderboard => leaderboard.trackedLeaderboards)
	@JoinColumn({ name: 'lb_id' })
	leaderboard!: Leaderboard;

	/** The ID of the role associated with the leaderboard in the discord. */
	@Column()
	role_id!: string;
}