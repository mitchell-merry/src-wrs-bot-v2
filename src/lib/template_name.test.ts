import { describe, it, expect } from 'vitest';
import { LeaderboardNameData, templateLeaderboardName } from './template_name';

describe('role name templating', () => {
    const cases: [string, LeaderboardNameData, number][] = [
        [
            'full-game, no sub-categories',
            { game: 'A Game', category: 'A Category' },
            0,
        ],
        [
            'level, no sub-categories',
            { game: 'A Game', level: 'A Level', category: 'A Category' },
            1,
        ],
        [
            'full-game, sub-categories',
            {
                game: 'A Game',
                category: 'A Category',
                subcategories: ['Value 1', 'Value 2'],
            },
            2,
        ],
        [
            'level, sub-categories',
            {
                game: 'A Game',
                level: 'A Level',
                category: 'A Category',
                subcategories: ['Value 1', 'Value 2'],
            },
            3,
        ],
    ];

    describe.each(cases)('%s', (_name, leaderboard, i) => {
        const expected = {
            '{{%game%}}{{: %level%}} - {{%category%}}{{ (%subcategories%)}} WR':
                [
                    'A Game - A Category WR',
                    'A Game: A Level - A Category WR',
                    'A Game - A Category (Value 1, Value 2) WR',
                    'A Game: A Level - A Category (Value 1, Value 2) WR',
                ],
            'WR: {{%game%}}{{: %level%}}': [
                'WR: A Game',
                'WR: A Game: A Level',
                'WR: A Game',
                'WR: A Game: A Level',
            ],
            'WR: {{%level%: }}{{%category%}}{{ (%subcategories%)}}': [
                'WR: A Category',
                'WR: A Level: A Category',
                'WR: A Category (Value 1, Value 2)',
                'WR: A Level: A Category (Value 1, Value 2)',
            ],
        } as const;

        it.each(Object.keys(expected))('for template %s', template => {
            expect(templateLeaderboardName(template, leaderboard)).toEqual(
                expected[template as keyof typeof expected][i],
            );
        });
    });
});
