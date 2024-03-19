# npm run build
cp ./build.sh ./build/
vcr deploy -f ./vcr.yaml  ./build/
