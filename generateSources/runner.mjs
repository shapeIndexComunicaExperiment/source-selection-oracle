import { QueryEngineFactory } from '@comunica/query-sparql-link-traversal-solid';
import { Command } from 'commander';

const program = new Command();
program
    .name('evaluation')
    .description('CLI program to run a SPARQL query using Comunica for the context of benchmarking')
    .version('0.0.0')

    .requiredOption('-q, --query <string>', 'query to execute')
    .requiredOption('-t, --timeout <number>', 'Timeout of the query in second')

    .parse(process.argv);

const options = program.opts();
const query = options.query;
const timeout = Number(options.timeout) * 1000;

const config_provenance = "./comunica-feature-link-traversal/engines/config-query-sparql-link-traversal/config/config-solid-why-provenance.json";

try {
    const resp = await executeQuery(query, timeout);
    console.log("response start");
    console.log(JSON.stringify(resp));
    console.log("response end");
} catch (err) {
    console.log("runner error");
    console.log(err);
}

export async function executeQuery(query, timeout) {
    const sources = new Set();
    return new Promise(async (resolve, reject) => {
        const engine = await new QueryEngineFactory().create({ config_provenance });
        const timeoutID = setTimeout(() => {
            console.log('Query timeout');
            resolve(
                "TIMEOUT"
            );
        }, timeout);
        let bindingsStream;

        try {
            bindingsStream = await engine.queryBindings(query, {
                lenient: true,
            });
        } catch (err) {
            reject(err);
        }


        bindingsStream.on('data', (binding) => {
            const currentSources = JSON.parse(binding.get("_source").value);
            for (const source of currentSources) {
                sources.add(source);
            }
        });

        bindingsStream.on('error', (err) => {
            console.error(err);
            clearTimeout(timeoutID);
            resolve(err);
        });

        bindingsStream.on('end', () => {
            clearTimeout(timeoutID);
            resolve(
                Array.from(sources)
            );
        });
    })
}