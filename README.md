# grpc-mp

![](https://flat.badgen.net/badge/platform/macos) 
![](https://flat.badgen.net/github/last-commit/11os/grpc-mp)

- 增加微信小程序支持
- 增加 fromObject 方法
- 详细过程见[grpc-mp让小程序支持gRPC](https://github.com/11os/grpc-mp/blob/master/grpc-mp.md)

## PS

1. 目前必须使用 mode=grpcwebtext。mode=grpcweb 在微信开发者工具与 iOS 真机调试中可以完美使用，但是在 android 真机中返回的 arraybuffer 在前 4 后 3 多出 7 位，造成解析不正常
2. 需要搭配(11os/protobuf -> protoc)与(11os/grpc-web -> protoc-gen-grpc-web)使用，扩展了小程序相关的代码
3. 改方案不建议生产环境使用，仅供科学研究，生产环境中 grpc 与 protobuf 源码文件较大，使小程序整体体积增大，对于需要快速加载的小程序用 rest/graphql 更为合适

## Usage

```sh
$ yarn add grpc-mp # or npm install grpc-mp
```

## Download Binary

download **protoc** & **protoc-gen-grpc-web** from [release](https://github.com/11os/grpc-mp/releases) page:

```sh
$ sh -c "$(curl -fsSL https://raw.githubusercontent.com/11os/grpc-mp/master/install.sh)"
```

## Manual Installation

1. prepare for mac

```sh
$ sudo xcode-select --install
$ sudo /opt/local/bin/port install autoconf automake libtool
```

2. build grpc-web

```sh
$ git clone https://github.com/11os/grpc-web.git
$ cd grpc-web
$ make install-plugin
# auto copy to /usr/local/bin
```

3.  build protoc

```sh
$ git clone https://github.com/11os/protobuf.git
$ cd protobuf
$ git submodule update --init --recursive
$ ./autogen.sh
$ ./configure
$ make
```


```sh
# copy to /usr/local/bin
cp ./src/protoc /usr/local/bin/protoc
cp ./src/.libs/* /usr/local/lib/
ln -s /usr/local/lib /usr/local/bin/.libs
```

## Example

### generate pb & grpc_web_pb

miniprogram
```sh
$ protoc ./*.proto \
--js_out=import_style=miniprogram:./src \
--grpc-web_out=import_style=miniprogram,mode=grpcwebtext:./src
```

commonjs
```sh
$ protoc ./*.proto \
--js_out=import_style=commonjs:./src \
--grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src
```

