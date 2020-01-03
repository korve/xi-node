const messages = require("./core/messages");
const assert = require("assert").strict;
const {View} = require("./core/view");
const {spawn} = require('child_process');
const {inherits} = require('util');
const {EventEmitter} = require('events');
const {RpcChannel} = require('./rpc/rpc-channel');
const debug = require('debug')('xi-node');

function Client(xiCorePath) {
    this.xiCorePath = xiCorePath;
    this.views = {};
}

Client.prototype.init = async function () {
    this.proc = spawn(`${this.xiCorePath}/xi-core`);
    this.rpcChannel = new RpcChannel(this.proc);
    // xi-core logs into stderr
    this.rpcChannel.on('error', this._log.bind(this));
    this.rpcChannel.on('notification', this._onNotification.bind(this));

    try {
        await this.rpcChannel.sendNotification(messages.client_started());
    } catch (e) {
        console.error('xi-core startup failed');
        console.error(e);
        process.exit(1);
    }
};

Client.prototype.newView = async function(filePath) {
    const viewId = await this.rpcChannel.send(messages.new_view(filePath));
    const view = new View(viewId, this);
    this.views[viewId] = view;
    debug(`view created ${viewId}`);
    return view;
};

Client.prototype.closeView = function(viewId) {
    this._assertViewExists(viewId);
    this.rpcChannel.sendNotification(messages.close_view(viewId));
    delete this.views[viewId];
    debug(`view ${viewId} closed`);
};

Client.prototype.save = function(viewId, filePath) {
    this._assertViewExists(viewId);
    this.rpcChannel.sendNotification(messages.save(viewId, filePath));
    debug(`view ${viewId} saved to ${filePath}`);
};

Client.prototype.setTheme = function(themeName) {
    this.rpcChannel.sendNotification(messages.setTheme(themeName));
};

Client.prototype.setLanguage = function(viewId, languageId) {
    this._assertViewExists(viewId);
    this.rpcChannel.sendNotification(messages.setLanguage(viewId, languageId));
};

Client.prototype.modifyUserConfig = function(domain, changes) {
    this.rpcChannel.sendNotification(messages.modifyUserConfig(domain, changes));
};

Client.prototype.getConfig = function(viewId) {
    this._assertViewExists(viewId);
    return this.rpcChannel.send(messages.getConfig(viewId));
};

Client.prototype._onNotification = function(message) {
    debug(`notification received: %o`, message);
};

Client.prototype._log = function(message) {
    process.stdout.write(message);
};

/**
 * Creates a client that can communicate with the xi-core backend
 * @param xiCorePath    The path to xi-core binary
 * @return {Promise<Client>}
 */
async function createClient(xiCorePath) {
    const client = new Client(xiCorePath);
    await client.init();
    return client;
}

Client.prototype._assertViewExists = function (viewId) {
    assert(this.views.hasOwnProperty(viewId), `view ${viewId} does not exist`);
};

inherits(Client, EventEmitter);

module.exports.Client = Client;
module.exports.createClient = createClient;
