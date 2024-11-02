pushd ./oracle/simple-comunica-runner
    ./install.sh
popd

pushd ./oracle/simple-solidbench-comunica-runner
    yarn node index.mjs -s ../../sources.json -q ../../queries -c ../../config.json -r 1 -e ../simple-comunica-runner/index.mjs -o ../../results &> ../../results/log
popd
