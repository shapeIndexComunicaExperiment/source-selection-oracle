pushd ./server
    ./install.sh
    yarn run solidbench-generate
    yarn run solidbench-serve &
popd
