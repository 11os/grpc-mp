# grpc-mp

- support wechat miniprogram
- 增加微信小程序支持
- 增加 fromObject 方法

## install grpc-mp

```sh
$ npm install grpc-mp
or
$ yarn add grpc-mp
```

## prepare for mac

```sh
$ sudo xcode-select --install
$ sudo /opt/local/bin/port install autoconf automake libtool
```

## build grpc-web

```sh
$ git clone https://github.com/11os/grpc-web.git
$ cd grpc-web
$ make install-plugin
```

## build protoc

```sh
$ git clone https://github.com/11os/protobuf.git
$ cd protobuf
$ git submodule update --init --recursive
$ ./autogen.sh
$ ./configure
$ make
```

dist </br>
./src/protoc </br>
./src/.lib

## example

### genreate pb & grpc_web_pb

```sh
$ protoc ./*.proto \
--js_out=import_style=miniprogram:./src \
--grpc-web_out=import_style=miniprogram,mode=grpcweb:./src
```
