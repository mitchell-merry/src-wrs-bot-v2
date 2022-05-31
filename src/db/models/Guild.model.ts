import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Guild {

	/** The discord guild's ID. */
	@PrimaryColumn()
	guild_id!: string;

	/** The default colour to give to newly created roles. */
	@Column({ default: "#FEE75C" })
	role_default_color!: string;

	/** The ID of the role to place new roles above. */
	@Column()
	above_role_id!: string;
}