import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LeaderboardEntity } from '.';

@Entity({ name: 'variable' })
export class VariableEntity {
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
    @ManyToOne(() => LeaderboardEntity, leaderboard => leaderboard.variables, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'lb_id' })
    leaderboard!: LeaderboardEntity;

    constructor(
        leaderboard: LeaderboardEntity,
        variable_id: string,
        value: string,
    ) {
        this.leaderboard = leaderboard;
        this.variable_id = variable_id;
        this.value = value;
    }
}
