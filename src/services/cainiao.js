export const serviceUrl = `ws://127.0.0.1:13528`;
export let socket = new WebSocket(serviceUrl);

export function doPrint(request) {
  if (socketConnStatus()) {
    socket.send(JSON.stringify(request));
  } else {
    alert("Printer Socket state: " + socket.readyState + " ！");
  }
}

function sendMessage(request) {
  request["requestID"] = (((1 + Math.random()) * 0x10000) | 0).toString(16);
  var textmsg = JSON.stringify(request);
  socket.send(textmsg);
}

export function checkPrinterStatus(printer) {
  if (socketConnStatus()) {
    var request = {
      cmd: "getPrinterConfig",
      version: "1.0",
      printer
    };

    sendMessage(request);
  } else {
    alert("Printer Socket state: " + socket.readyState + " ！");
  }
}

function socketConnStatus() {
  if (typeof socket === "undefined" || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket(serviceUrl);
  }

  if (socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  return true;
}
