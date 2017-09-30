export const socket = new WebSocket("ws://127.0.0.1:13528");
export function doConnect() {
  // 打开Socket
  socket.onopen = function(event) {
    // 监听消息
    socket.onmessage = function(event) {
      console.log("Client received a message", event);
    };

    // 监听Socket的关闭
    socket.onclose = function(event) {
      console.log("Client notified socket has closed", event);
    };
  };
}

export function doPrint(request) {
  socket.send(JSON.stringify(request));
}
