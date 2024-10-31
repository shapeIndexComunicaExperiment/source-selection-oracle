import { QueryEngineFactory } from '@comunica/query-sparql-link-traversal-solid';

const config_provenance = "./comunica-feature-link-traversal/engines/config-query-sparql-link-traversal/config/config-solid-why-provenance.json";

export async function executeQuery(query, timeout) {
    const sources = new Set();
    return new Promise(async (resolve, reject) => {
        const engine = await new QueryEngineFactory().create({ config_provenance });
        const timeoutID = setTimeout(() => {
            console.log('Query timeout');
            reject(
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
            reject(err);
        });

        bindingsStream.on('end', () => {
            clearTimeout(timeoutID);
            resolve(
                sources
            );
        });
    })
}