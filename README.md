# grpc-mp

- support wechat miniprogram  
- 增加微信小程序支持 
- 增加fromObject方法

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

### before rpcCall

```javascript
const client = new service.IAdminUserServicePromiseClient(
  `${hostUrlwithPort}`
)

let newXhr = client.delegateClient_.client_.newXhr_ // hack newXhr function
client.delegateClient_.client_.newXhr_ = () => {
  let xhr = newXhr()
  xhr.xmlHttpFactory_ = { // replace grpc-web XmlHttpRequest 
    createInstance: () => {
      return new parent.__global.XMLHttpRequest() // make sure parent = window
    },
    getOptions: () => {
      return {}
    }
  }
  xhr.setProgressEventsEnabled(true)
  return xhr
}

client.login(request, {}).then((resp) => {
  console.log(resp)
})

```
