import { getQueries } from './queries.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { Command } from 'commander';

const program = new Command();
program
    .name('evaluation')
    .description('CLI program to run a SPARQL query using Comunica for the context of benchmarking')
    .version('0.0.0')

    .option('-r, --reRun <string...>', 'file with the queries to rerun', undefined)
    .option('-t, --timeout <number>', 'timeout of a query in second', 300)
    .option('-m, --memorySize <number>', 'memory allocated to execute a query', 15_000)

    .parse(process.argv);

const options = program.opts();
const reRun = options.reRun !== undefined ? new Set(options.reRun) : undefined;
const timeout = options.timeout * 1000;
const memorySize = options.memorySize;

const RESULT_REGEX = /response start\n(.*)\nresponse end/u;
const runnerCommand = "./runner.mjs"
let querySourcesObject = {};

if (reRun !== undefined) {
    querySourcesObject = JSON.parse(await readFile("../sources.json"));
}

const groupQueries = getQueries(reRun);

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

