import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { GuildEntity } from '.';

@Entity({ name: 'moderator_role' })
export class ModeratorRoleEntity {
    /** The ID of the guild the moderator role belongs to. */
    @PrimaryColumn()
    guild_id!: string;

    /** The ID of the role in the guild. */
    @PrimaryColumn()
    role_id!: string;

    /** The leaderboard which this variable is attached to. */
    @ManyToOne(() => GuildEntity, guild => guild.moderatorRoles, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'guild_id' })
    guild!: GuildEntity;

    constructor(guild_id: string, role_id: string) {
        this.guild_id = guild_id;
        this.role_id = role_id;
    }
}
