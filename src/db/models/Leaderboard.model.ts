import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { TrackedLeaderboard, Variable } from "./";

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

	/** The last known name of the associated leaderboard. */
	@Column()
	lb_name!: string;

	/** The variables to filter this leaderboard by. */
	@OneToMany(() => Variable, variable => variable.leaderboard)
	variables!: Variable[];

	/** Where this leaderboard is being tracked. */
	@OneToMany(() => TrackedLeaderboard, tlb => tlb.leaderboard)
	trackedLeaderboards!: TrackedLeaderboard[];

	constructor(game_id: string, category_id: string, lb_name: string, variables: Variable[]) {
		this.game_id = game_id;
		this.category_id = category_id;
		this.lb_name = lb_name;
		this.variables = variables;
	}
}