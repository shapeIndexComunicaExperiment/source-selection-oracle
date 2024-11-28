# Source Selection Oracle

An experiment to generate the query relevant sources of the solidbench queries.
The queries are available at `./queries/`.

## Dependencies
 - [Nodejs version 22](https://nodejs.org/en)

Has only been tested on Linux

## Installation

Make sure that all the submodules [are correctly installed](https://git-scm.com/book/en/v2/Git-Tools-Submodules) 

## Instantiate and serve the network

```sh
cd server
yarn install
yarn run solidbench-generate
yarn run solidbench-serve
```

## Generate the query-relevant sources

Will generate the `./sources.json` file containing all the relevant sources for each query.

```sh
cd generateSources
./install
node index.mjs
```

## Evaluation with an oracle of source selection
Evaluate the queries using the sources from `./sources.json`.
The results will be output in `./results.` 

```sh
pushd ./oracle/simple-comunica-runner
    ./install.sh
popd

pushd ./oracle/simple-solidbench-comunica-runner
    yarn node index.mjs -s ../../sources.json -q ../../queries -c ../../config.json -r 50 -e ../simple-comunica-runner/index.mjs -o ../../results &> ../../results/log
popd
```