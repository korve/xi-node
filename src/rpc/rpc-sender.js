const {EOL} = require('os');

function RpcSender(stdin) {
    this.stdin = stdin;
    this._id = 0;
}

RpcSender.prototype.send = function(method, params) {
    const id = this._getNextId();
    this.stdin.write(JSON.stringify({id, method, params}) + EOL);
    return id;
};

RpcSender.prototype.sendNotification = function(method, params) {
    this.stdin.write(JSON.stringify({method, params}) + EOL);
};

RpcSender.prototype._getNextId = function() {
    const id = this._id;
    if (this._id + 1 > Number.MAX_SAFE_INTEGER) {
        this._id = 0;
    } else {
        this._id += 1;
    }
    return id;
};

module.exports.RpcSender = RpcSender;
