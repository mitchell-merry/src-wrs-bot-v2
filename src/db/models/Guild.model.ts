import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Guild {

	@PrimaryColumn()
	guild_id!: string;

	@Column({ default: "#FEE75C" })
	role_default_color!: string;

	@Column()
	above_role_id!: string;
}