
mkdir -p grpc-mp
cp ../protobuf/src/protoc ./grpc-mp/
cp -r ../protobuf/src/.libs ./grpc-mp/
cp /usr/local/bin/protoc-gen-grpc-web ./grpc-mp/
tar -zcvf ./grpc-mp.tar.gz ./grpc-mp/