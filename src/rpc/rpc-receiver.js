const {inherits} = require('util');
const {EventEmitter} = require('events');
const {EOL} = require('os');

function RpcReceiver(stdout, stderr) {
    if (stdout) {
        stdout.on('data', this._handleMessage.bind(this));
    }
    if (stderr) {
        stderr.on('data', this._handleErr.bind(this));
    }
}

RpcReceiver.prototype.awaitResponse = function(id) {
    return new Promise((resolve, reject) => {
        const onMessage = (message) => {
            if (message.id !== id) {
                return;
            }

            if (message.error) {
                reject(message.error);
            } else {
                resolve(message.result);
            }

            this.off('message', onMessage);
        };

        this.on('message', onMessage);
    });
};

RpcReceiver.prototype._handleMessage = function (chunk) {
    const messages = this._parseMessages(chunk);
    messages.forEach((message) => {
        if (message.id !== undefined) {
            this.emit('message', message);
        } else {
            this.emit('notification', message);
        }
    });
};

RpcReceiver.prototype._handleErr = function (chunk) {
    this.emit('error', chunk.toString());
};

RpcReceiver.prototype._parseMessages = function(chunk) {
    return chunk.toString().trim().split(EOL).map(JSON.parse);
};

inherits(RpcReceiver, EventEmitter);

module.exports.RpcReceiver = RpcReceiver;
