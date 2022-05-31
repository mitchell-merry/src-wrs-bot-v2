import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { TrackedLeaderboard } from "./";

@Entity()
export class Leaderboard {

	/** The unique leaderboard ID - auto-generated. */
	@PrimaryGeneratedColumn()
	lb_id!: number;

	/** The ID of the game of the leaderboard. */
	@Column()
	game_id!: string;

	/** The ID of the category of the leaderboard. */
	@Column()
	category_id!: string;

	/** Where this leaderboard is being tracked. */
	@OneToMany(() => TrackedLeaderboard, tlb => tlb.leaderboard)
	trackedLeaderboards!: TrackedLeaderboard[];
}