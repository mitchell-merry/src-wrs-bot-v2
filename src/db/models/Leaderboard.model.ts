import { Variable } from "src-ts";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { DB } from "..";
import { TrackedLeaderboardEntity, VariableEntity } from "./";

@Entity({ name: 'leaderboard' })
export class LeaderboardEntity {

	/** The unique leaderboard ID - auto-generated. */
	@PrimaryGeneratedColumn()
	lb_id!: number;

	/** The ID of the game of the leaderboard. */
	@Column()
	game_id!: string;

	/** The ID of the category of the leaderboard. */
	@Column()
	category_id!: string;

	/** The ID of the level of the leaderboard. If null, then this is full-game. */
	@Column({ nullable: true })
	level_id?: string;

	/** The last known name of the associated leaderboard. */
	@Column()
	lb_name!: string;

	/** The variables to filter this leaderboard by. */
	@OneToMany(() => VariableEntity, variable => variable.leaderboard, { cascade: true })
	variables!: VariableEntity[];

	/** Where this leaderboard is being tracked. */
	@OneToMany(() => TrackedLeaderboardEntity, tlb => tlb.leaderboard, { cascade: true })
	trackedLeaderboards!: TrackedLeaderboardEntity[];

	constructor(game_id: string, category_id: string, lb_name: string, level_id?: string) {
		this.game_id = game_id;
		this.category_id = category_id;
		this.lb_name = lb_name;
		this.level_id = level_id;
	}

	static async exists(game_id: string, category_id: string, variables: [Variable, string][], level_id?: string) {
		const lRepo = DB.getRepository(LeaderboardEntity);
		
		// check leaderboard with same game/cat exists (multiple may)
		const possibles = await lRepo.find({ where: { game_id, category_id, level_id }, relations: { variables: true, trackedLeaderboards: true } });

		// check to see if any have all variables match
		return possibles.find(board => board.variables.every(
			varEnt => variables.find(([variable, value]) => varEnt.variable_id === variable.id && varEnt.value === value)
		));
	}
}