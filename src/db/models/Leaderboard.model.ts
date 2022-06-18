import { Variable } from "src-ts";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { DB } from "..";
import { TrackedLeaderboard, Variable as VariableEntity } from "./";
import { GuildEntity } from "./Guild.model";

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
	@OneToMany(() => TrackedLeaderboard, tlb => tlb.leaderboard, { cascade: true })
	trackedLeaderboards!: TrackedLeaderboard[];

	constructor(game_id: string, category_id: string, lb_name: string) {
		this.game_id = game_id;
		this.category_id = category_id;
		this.lb_name = lb_name;
	}

	static async exists(game_id: string, category_id: string, variables: [Variable, string][]) {
		const lRepo = DB.getRepository(Leaderboard);
		
		// check leaderboard with same game/cat exists (multiple may)
		const possibles = await lRepo.find({ where: { game_id, category_id }, relations: { variables: true, trackedLeaderboards: true } });

		// check to see if any have all variables match
		return possibles.find(board => board.variables.every(
			varEnt => variables.find(([variable, value]) => varEnt.variable_id === variable.id && varEnt.value === value)
		));
	}
}