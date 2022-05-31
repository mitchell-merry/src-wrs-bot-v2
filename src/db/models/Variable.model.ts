import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Leaderboard } from "./";

@Entity()
export class Variable {

	/** The ID of the variable in speedrun.com this represents. */
	@PrimaryColumn()
	lb_id!: number;

	/** The ID of the variable in speedrun.com this represents. */
	@PrimaryColumn()
	variable_id!: string;

	/** The value of the variable. */
	@Column()
	value!: string;

	/** The leaderboard which this variable is attached to. */
	@ManyToOne(() => Leaderboard, leaderboard => leaderboard.variables)
	@JoinColumn({ name: 'lb_id' })
	leaderboard!: Leaderboard;
}