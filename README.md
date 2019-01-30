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

dist </br>
protoc-gen-grpc-web

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

### generate pb & grpc_web_pb

```sh
$ protoc ./*.proto \
--js_out=import_style=miniprogram:./src \
--grpc-web_out=import_style=miniprogram,mode=grpcwebtext:./src
```

##

1. 目前必须使用 mode=grpcwebtext，mode=grpcweb 在微信开发者工具与 iOS 真机调试中可以完美使用，但是在 android 真机中返回的 arraybuffer 在前 4 后 3 多出 7 位，造成解析不正常
2. 需要搭配(11os/protobuf -> protoc)与(11os/grpc-web -> protoc-gen-grpc-web)使用，扩展了小程序相关的代码
