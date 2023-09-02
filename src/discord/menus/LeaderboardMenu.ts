import { ChatInputCommandInteraction } from 'discord.js';
import * as SRC from 'src-ts';
import UserError from '../UserError';
import DialogueMenu from './DialogueMenu';

export default class LeaderboardMenu {
    private static types = {
        'per-game': 'Full-game',
        'per-level': 'Level',
    } as const;

    constructor() {}

    public async spawnMenu(
        interaction: ChatInputCommandInteraction,
        gameId: string,
    ) {
        // get all the game info from speedrun.com
        const game = await SRC.getGame<'categories.variables,levels'>(gameId, {
            embed: 'categories.variables,levels',
        });

        // get the type of the leaderboard (full game / level)
        const type = await this.selectType(interaction, game);
        let message = `Selected "${LeaderboardMenu.types[type]}".\n`;

        // get the level of the leaderboard, if selected level
        let level: SRC.Level | undefined;
        if (type === 'per-level') {
            level = await this.selectLevel(
                interaction,
                message,
                game.levels.data,
            );
            message += `Selected the level "${level.name}".\n`;
        }

        // get the category for the leaderboard
        const category = await this.selectCategory(
            interaction,
            message,
            game.categories.data,
            type,
        );
        message += `Selected the category "${category.name}"\n`;

        // update the message with the current selections (this is done with DialogueMenu in the previous two steps)
        await interaction.editReply({ content: message });

        // get the variables if any
        const variables = await this.selectVariables(
            interaction,
            message,
            category.variables.data,
            level,
        );

        return { game, level, category, variables };
    }

    public async selectType(
        interaction: ChatInputCommandInteraction,
        game: SRC.Game<'categories.variables,levels'>,
    ): Promise<SRC.CategoryType> {
        if (game.levels.data.length === 0 && game.categories.data.length === 0)
            throw new UserError(
                `The game ${game.names.international} has no leaderboards!`,
            );

        if (
            game.levels.data.length !== 0 &&
            game.categories.data.length !== 0
        ) {
            const [type] = await new DialogueMenu<SRC.CategoryType>(
                `Is the leaderboard a full-game or level category?`,
                LeaderboardMenu.types,
            ).spawnMenu(interaction, 'EDIT_REPLY');
            return type;
        } else if (game.levels.data.length === 0) return 'per-game';
        else return 'per-level';
    }

    public async selectLevel(
        interaction: ChatInputCommandInteraction,
        message: string,
        levels: SRC.Level[],
    ) {
        if (levels.length === 1) return levels[0];

        const q = (message !== '' ? `${message}\n` : '') + 'Choose a level:';
        const levelOptions = levels.map(level => ({
            id: level.id,
            label: level.name,
        }));
        const [levelId] = await new DialogueMenu(q, levelOptions).spawnMenu(
            interaction,
            'EDIT_REPLY',
        );

        return levels.find(l => l.id === levelId)!;
    }

    public async selectCategory<E extends string, T extends SRC.CategoryType>(
        interaction: ChatInputCommandInteraction,
        message: string,
        categories: SRC.Category<E, T>[],
        type: T,
    ) {
        const categoriesOfType = categories.filter(c => c.type === type);
        if (categoriesOfType.length === 1) return categoriesOfType[0];

        const q = (message !== '' ? `${message}\n` : '') + 'Choose a category:';
        const catOptions = categoriesOfType.map(c => ({
            id: c.id,
            label: c.name,
        }));
        const [categoryId] = await new DialogueMenu(q, catOptions).spawnMenu(
            interaction,
            'EDIT_REPLY',
        );

        return categories.find(c => c.id === categoryId)!;
    }

    public async selectVariables(
        interaction: ChatInputCommandInteraction,
        message: string,
        variables: SRC.Variable[],
        level?: SRC.Level,
    ): Promise<[SRC.Variable, string][]> {
        const selectedVariables: string[] = [];

        return Promise.all(
            variables
                .filter(SRC.variableIsSubcategory)
                .filter(
                    v =>
                        level === undefined ||
                        v.scope.type === 'global' ||
                        v.scope.type === 'all-levels' ||
                        (v.scope.type === 'single-level' &&
                            v.scope.level === level.id),
                )
                .map(async subcat => {
                    const options = Object.entries(subcat.values.values).map(
                        ([k, v]) => ({ id: k, label: v.label }),
                    );

                    const [value, valueLabel] = await new DialogueMenu(
                        `Choose a value for the variable ${subcat.name}:`,
                        options,
                    ).spawnMenu(interaction, 'NEW_REPLY');

                    selectedVariables.push(
                        `Selected the value ${valueLabel} for variable ${subcat.name}.`,
                    );
                    interaction.editReply(
                        `${message}\n${selectedVariables.join('\n')}`,
                    );

                    return [subcat, value];
                }),
        );
    }
}
