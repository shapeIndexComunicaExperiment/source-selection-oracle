import { join } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';

const QUERY_FOLDER = "../queries";

export function getQueries(queriesToExecute, reRunVersion) {
    const fileList = readdirSync(QUERY_FOLDER);
    const queries = new Map();
    for (const file of fileList) {
        const queryName = file.replace(/\.[^/.]+$/, "");

        if (queriesToExecute === undefined || queriesToExecute.has(queryName)) {
            const content = readFileSync(join(QUERY_FOLDER, file)).toString();
            const contentSplit = content.split("\n\n");
            if (reRunVersion !== undefined) {
                const contents = [null, null, null, null, null];
                for (const v of reRunVersion) {
                    contents[v] = contentSplit[v];
                }
                queries.set(queryName, contents);
            } else {
                queries.set(queryName, contentSplit);
            }
        }
    }
    return queries;
}
