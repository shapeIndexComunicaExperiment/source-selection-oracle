import { getQueries } from './queries.mjs';
import { executeQuery } from './runner.mjs';
import { writeFile } from 'node:fs/promises';

const timeout = 120 * 1000;
const querySourcesObject = {};

const groupQueries = getQueries();

for (const [name, queryGroup] of groupQueries) {
    querySourcesObject[name] = {};
    for (const [index, query] of queryGroup.entries()) {
        console.log(`query ${name} v${index} started`);
        try {
            const sources = await executeQuery(query, timeout);
            querySourcesObject[name][index] = sources;

            console.log(`query ${name} v${index} executed`);
        } catch (error) {
            console.log(`query ${name} v${index} failed`);
            querySourcesObject[name][index] = err;
            console.error(error);
        }
    }
    writeFile("./sources.json", JSON.stringify(querySourcesObject, null, 2));
}
writeFile("./sources.json", JSON.stringify(querySourcesObject, null, 2));




