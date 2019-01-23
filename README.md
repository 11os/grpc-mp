# grpc-weapp

> support wechat miniprogram  <br/>
> 增加微信小程序支持 <br/>
> 增加fromObject方法

## Env MacOS

> sudo xcode-select --install <br/>
> sudo /opt/local/bin/port install autoconf automake libtool <br/>

# grpc-web

## Manual Installation

> git clone https://github.com/11os/grpc-web.git <br/>
> cd grpc-web <br/>
> make install-plugin <br/>

# protoc

## Manual Installation

> git clone https://github.com/11os/protobuf.git <br/>
> cd protobuf <br/>
> git submodule update --init --recursive <br/>
> ./autogen.sh <br/>
> ./configure <br/>
> make <br/>

export
  ./src/protoc // copy to /usr/local/bin <br/>
  ./src/.lib // copy to /usr/local/lib
   

# Example

## Genreate pb & grpc_web_pb

> protoc ./*.proto \
--js_out=import_style=weapp:./src \
--grpc-web_out=import_style=weapp,mode=grpcweb:./src

## Before rpcCall

```
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
