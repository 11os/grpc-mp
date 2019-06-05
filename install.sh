# download binary
wget https://github.com/11os/grpc-mp/releases/download/v1.0.0/grpc-mp.tar.gz

# unzip
tar -zxvf grpc-mp.tar.gz
cd grpc-mp

# copy to bin
sudo cp ./protoc /usr/local/bin/protoc
sudo cp ./protoc-gen-grpc-web /usr/local/bin/protoc-gen-grpc-web
sudo cp ./.libs/* /usr/local/lib/
sudo ln -s /usr/local/lib /usr/local/bin/.libs

# check
protoc --version
which protoc-gen-grpc-web