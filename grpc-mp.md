# grpc-mp

[https://github.com/11os/grpc-mp](https://github.com/11os/grpc-mp)

该方案不建议生产环境使用，生产环境中 grpc 与 protobuf 源码文件较大对于需要快速加载的小程序用 rest/graphql 更为合适

## 分析 grpc-web 源码

```javascript
// https://github.com/grpc/grpc-web/javascript/net/grpc/web/grpcwebclientbase.js
const XhrIo = goog.require('goog.net.XhrIo');

GrpcWebClientBase.prototype.rpcCall = function(
    method, request, metadata, methodInfo, callback) {
  var xhr = this.newXhr_();
  ...
}

GrpcWebClientBase.prototype.newXhr_ = function() {
  return new XhrIo();
};
```

grpc-web 调用 closure-library 中的 XhrIo 进行网络请求

```javascript
// https://github.com/google/closure-library/blob/master/closure/goog/net/xhrio.js
goog.net.XhrIo.prototype.send = function(
    url, opt_method, opt_content, opt_headers) {
  ...
  // Use the factory to create the XHR object and options
  this.xhr_ = this.createXhr();
  ...
}

goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ? this.xmlHttpFactory_.createInstance() :
                                goog.net.XmlHttp();
};
```

```javascript
// https://github.com/google/closure-library/blob/master/closure/goog/net/xmlhttp.js
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() {
  var progId = this.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest();
  }
};
```

XhrIo 对浏览器自带网络请求进行封装，使用过程中可将自定义的 xmlHttpFactory 通过重写 createXhr 的方式传入。
由于小程序真机环境中并不存在 XmlHttpRequest。需要用 wx.request 重写 grpc-web 网络请求，并按 protobuf 编码解码、序列化反序列化规则对 request 与 response 进行处理。

**最终实现效果如下：**

```javascript
// https://github.com/11os/grpc-web/blob/master/javascript/net/grpc/web/grpcmpclientbase.js
const GrpcMpClientBase = function(opt_options) {
  this.format_ = goog.getObjectByName("format", opt_options) || "text";
  this.request_ = goog.getObjectByName("request", opt_options); // 在外部将wx.request传入
};

GrpcMpClientBase.prototype.rpcCall = function(
  method,
  request,
  metadata,
  methodInfo,
  callback
) {
  let data = [].slice.call(
    this.encodeRequest(methodInfo.requestSerializeFn(request))
  );
  let contentType =
    this.format_ == "text"
      ? "application/grpc-web-text"
      : "application/grpc-web+proto";
  let requestData =
    this.format_ == "text"
      ? googCrypt.encodeByteArray(data)
      : data.map(item => String.fromCharCode(item)).join("");
  let dataType = this.format_ == "text" ? "text" : "arraybuffer";
  this.request_({
    method: "POST",
    header: {
      accept: contentType,
      "content-type": contentType,
      "X-Grpc-Web": "1",
      "X-User-Agent": "grpc-web-javascript/0.1"
    },
    dataType: dataType,
    responseType: dataType,
    data: requestData,
    url: method,
    success: res => {
      this.decodeResponse(res, methodInfo.responseDeserializeFn, callback);
    },
    fail: res => {
      callback({ message: res["errMsg"] }, null);
    }
  });
};
```

## protobuf

基于 grpc-mp，为了最大限度的复用 protobuf 生成的 pb 与 service，最初采用默认的 commonsjs 进行文件生成：

```sh
protoc ./*.proto \
--js_out=import_style=commonjs:./src \
--grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src
```

```javascript
var global = Function("return this")();
```

生成的文件中用到了 Function 构造器，global 指向浏览器 window，由于小程序中均对此[**不支持**](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html#%E5%8F%91%E5%B8%83%20npm%20%E5%8C%85)，于是 js_out 改用 commonjs_strict：

```sh
protoc ./*.proto \
--js_out=import_style=commonjs_strict:./src \
--grpc-web_out=import_style=commonjs,mode=grpcwebtext:./src
```

生成的文件不够完美，需要手动将结尾的 goog.object.extend(exports, proto 改为 proto.xxx.xxx);
这样在 Service_grpc_web_pb.js 文件中才能正确被引用，于是对 protobuf 中 js_generator 源码进行扩展，import_style 增加 miniprogram。 -> [11os/protobuf](https://github.com/11os/protobuf)

## proto-gen-grpc-web

由于修改了 grpc-web 部分源码，为方便 npm 进行管理，将项目取名 grpc-mp 上传至 npm。
同样对 proto-gen-grpc-web 进行扩展，import_style 增加 miniprogram，默认 require 指向 grpc-mp，并将 GrpcWebClientBase 指向 GrpcMpClientBase。-> [11os/grpc-web](https://github.com/11os/protobuf)

配合 grpc-mp，最终将用法变更为：

```sh
protoc ./*.proto \
--js_out=import_style=miniprogram:./src \
--grpc-web_out=import_style=miniprogram,mode=grpcwebtext:./src
```
