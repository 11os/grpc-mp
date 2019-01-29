var module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase = function(a) {
  this.format_ = goog.getObjectByName('format', a) || 'text';
  this.request_ = goog.getObjectByName('request', a) || wx.request;
  this.suppressCorsPreflight_ =
    goog.getObjectByName('suppressCorsPreflight', a) || !1;
};

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.prototype.parser_ = new module$contents$grpc$web$GrpcWebStreamParser_GrpcWebStreamParser();

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.prototype.rpcCall = function(
  method,
  request,
  metadata,
  methodInfo,
  callback
) {
  let data = [].slice.call(this.encodeRequest(request.serializeBinary()));
  let contentType =
    this.format_ == 'text'
      ? 'application/grpc-web-text'
      : 'application/grpc-web+proto';
  let requestData =
    this.format_ == 'text'
      ? goog.crypt.base64.encodeByteArray(data)
      : data.map(item => String.fromCharCode(item)).join('');
  let dataType = this.format_ == 'text' ? 'text' : 'arraybuffer';
  this.request_({
    method: 'POST',
    header: {
      accept: contentType,
      'content-type': contentType,
      'X-Grpc-Web': '1',
      'X-User-Agent': 'grpc-web-javascript/0.1'
    },
    dataType: dataType,
    responseType: dataType,
    data: requestData,
    url: method,
    success: res => {
      this.decodeResponse(res, methodInfo.responseDeserializeFn, callback);
    },
    fail: ({ errMsg }) => {
      callback(
        {
          message: errMsg
        },
        null
      );
    }
  });
};

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.prototype.parseHttp1Headers_ = function(
  str
) {
  var chunks = str.trim().split('\r\n');
  var headers = {};
  for (var i = 0; i < chunks.length; i++) {
    var pos = chunks[i].indexOf(':');
    headers[chunks[i].substring(0, pos).trim()] = chunks[i]
      .substring(pos + 1)
      .trim();
  }
  return headers;
};

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.prototype.encodeRequest = function(
  serialized
) {
  var len = serialized.length;
  var bytesArray = [0, 0, 0, 0];
  var payload = new Uint8Array(5 + len);
  for (var i = 3; i >= 0; i--) {
    bytesArray[i] = len % 256;
    len = len >>> 8;
  }
  payload.set(new Uint8Array(bytesArray), 1);
  payload.set(serialized, 5);
  return payload;
};

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.prototype.decodeResponse = function(
  res,
  responseDeserializeFn_,
  callback
) {
  let { data, statusCode, header } = res;
  const GRPC_STATUS = 'grpc-status';
  const GRPC_STATUS_MESSAGE = 'grpc-message';
  var grpcStatusCode = header[GRPC_STATUS];
  var grpcStatusMessage = header[GRPC_STATUS_MESSAGE];
  if (grpcStatusCode && grpcStatusMessage) {
    callback(
      {
        code: Number(grpcStatusCode),
        message: grpcStatusMessage
      },
      null
    );
  }

  const contentType = 'application/grpc-web-text';
  if (contentType.indexOf('text') > -1) {
    var pos_ = 0;
    var responseText = data;
    var newPos = responseText.length - responseText.length % 4;
    var newData = responseText.substr(pos_, newPos - pos_);
    if (newData.length == 0) return;
    pos_ = newPos;
    var byteSource = [].slice.call(
      goog.crypt.base64.decodeStringToUint8Array(data)
    );
  } else {
    var byteSource = [].slice.call(new Uint8Array(data));
  }

  var messages = this.parser_.parse(byteSource);
  if (!messages) return {};

  const FrameType = module$contents$grpc$web$GrpcWebStreamParser_FrameType;
  for (var i = 0; i < messages.length; i++) {
    if (FrameType.DATA in messages[i]) {
      data = messages[i][FrameType.DATA];
      if (data) {
        var response = responseDeserializeFn_(data);
        callback(null, response);
      }
    }
    if (FrameType.TRAILER in messages[i]) {
      if (messages[i][FrameType.TRAILER].length > 0) {
        var trailerString = '';
        for (var pos = 0; pos < messages[i][FrameType.TRAILER].length; pos++) {
          trailerString += String.fromCharCode(
            messages[i][FrameType.TRAILER][pos]
          );
        }
        var trailers = this.parseHttp1Headers_(trailerString);
        grpcStatusCode = module$contents$grpc$web$StatusCode_StatusCode.OK;
        grpcStatusMessage = '';
        if (GRPC_STATUS in trailers) {
          grpcStatusCode = trailers[GRPC_STATUS];
        }
        if (GRPC_STATUS_MESSAGE in trailers) {
          grpcStatusMessage = trailers[GRPC_STATUS_MESSAGE];
        }
        callback(
          {
            code: Number(grpcStatusCode),
            message: grpcStatusMessage
          },
          null
        );
      }
    }
  }
  return messages;
};

module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase.setCorsOverride_ = function(
  a,
  b
) {
  return module$exports$goog$net$rpc$HttpCors.setHttpHeadersWithOverwriteParam(
    a,
    module$exports$goog$net$rpc$HttpCors.HTTP_HEADERS_PARAM_NAME,
    b
  );
};
grpc.web.GrpcMpClientBase = module$contents$grpc$web$GrpcMpClientBase_GrpcMpClientBase;
