const {inherits} = require("util");
const {EventEmitter} = require("events");
const {RpcSender} = require("./rpc-sender");
const {RpcReceiver} = require("./rpc-receiver");

function RpcChannel(proc) {
    this.rpcSender = new RpcSender(proc.stdin);
    this.rpcReceiver = new RpcReceiver(proc.stdout, proc.stderr);
    this.rpcReceiver.on('error', this._onError.bind(this));
    this.rpcReceiver.on('notification', this._onNotification.bind(this));
}

RpcChannel.prototype.send = function({method, params}) {
    const id = this.rpcSender.send(method, params);
    return this.rpcReceiver.awaitResponse(id);
};

RpcChannel.prototype.sendNotification = function({method, params}) {
    this.rpcSender.sendNotification(method, params);
};

RpcChannel.prototype._onError = function(error) {
    this.emit('error', error);
};

RpcChannel.prototype._onNotification = function(message) {
    this.emit('notification', message);
};

inherits(RpcChannel, EventEmitter);

module.exports.RpcChannel = RpcChannel;
