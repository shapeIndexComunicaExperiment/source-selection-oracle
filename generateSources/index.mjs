import { getQueries } from './queries.mjs';
import { writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const RESULT_REGEX = /response start\n(.*)\nresponse end/u;
const runnerCommand = "./runner.mjs"
const timeout = 10000 * 1000;
const memorySize = 15_000;
const querySourcesObject = {};

const groupQueries = getQueries();

for (const [name, queryGroup] of groupQueries) {
    querySourcesObject[name] = {};
    for (const [index, query] of queryGroup.entries()) {
        console.log(`query ${name} v${index} started`);
        try {
            const command = createCommand(runnerCommand, query, memorySize);
            const { stdout, _stderr, error } = spawnSync(command[0], command[1], { timeout: timeout + 1000, maxBuffer: undefined });
            if (error && error.code === 'ETIMEDOUT') {
                querySourcesObject[name][`v${index}`] = "TIMEOUT"
            }
            const stdoutSerialized = JSON.parse(RESULT_REGEX.exec(String(stdout))[1]);

            querySourcesObject[name][`v${index}`] = stdoutSerialized;
            console.log(`query ${name} v${index} executed`);
        } catch (error) {
            console.log(`query ${name} v${index} failed`);
            querySourcesObject[name][`v${index}`] = null;
            console.error(error);
        }
        await writeFile("../sources.json", JSON.stringify(querySourcesObject, null, 2));
    }
}
await writeFile("../sources.json", JSON.stringify(querySourcesObject, null, 2));


function createCommand(runnerCommand, query, memorySize) {
    const command = "yarn";
    const formattedQuery = query.replace(/(\r\n|\n|\r)/gm, " ");

    const args = [
        'node',
        `--max-old-space-size=${memorySize}`,
        runnerCommand,
        '-q', formattedQuery,
        '-t', timeout.toString()
    ];
    return [command, args];
}

