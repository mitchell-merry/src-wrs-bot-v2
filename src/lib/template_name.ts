export type LeaderboardNameData = {
    game: string;
    category: string;
    subcategories?: string[];
    level?: string;
};

const templateReg = /{{.+?}}/g;
const keyReg = /%.+?%/g;

export function templateLeaderboardName(
    name: string,
    leaderboard: LeaderboardNameData,
) {
    const names = {
        ...leaderboard,
        subcategories: leaderboard.subcategories?.join(', '),
    };

    let finalName = name;

    const templates = name.matchAll(templateReg);
    for (const templateStr of templates) {
        const keysToTemplate = templateStr[0].matchAll(keyReg);
        let replaceWith = templateStr[0].substring(
            2,
            templateStr[0].length - 2,
        );

        for (const keyToTemplate of keysToTemplate) {
            let rawKey = keyToTemplate[0];
            const key = rawKey.substring(
                1,
                rawKey.length - 1,
            ) as keyof LeaderboardNameData;

            let value = names[key];
            if (value === undefined) {
                replaceWith = '';
                break;
            }

            replaceWith = replaceWith.replace(keyToTemplate[0], value);
        }

        finalName = finalName.replace(templateStr[0], replaceWith);
    }

    return finalName;
}
