const assert = require("assert").strict;

function View(viewId, client) {
    this.viewId = viewId;
    this.client = client;
    this.closed = false;
}

View.prototype.close = function() {
    this._checkIsOpen();
    this.closed = true;
    return this.client.closeView(this.viewId);
};

View.prototype.save = function(filePath) {
    this._checkIsOpen();
    assert(filePath, "filePath is required");
    return this.client.save(this.viewId, filePath);
};

View.prototype.setLanguage = function(languageId) {
    this._checkIsOpen();
    assert(languageId, "languageId is required");
    return this.client.setLanguage(this.viewId, languageId);
};

View.prototype.modifyUserConfig = function(changes) {
    this._checkIsOpen();
    return this.client.modifyUserConfig({"user_override": this.viewId}, changes);
};

View.prototype.getConfig = function() {
    this._checkIsOpen();
    return this.client.getConfig(this.viewId);
};

View.prototype._checkIsOpen = function() {
    assert.equal(this.closed, false, `${this.viewId} is closed. you cannot perform any actions on this view anymore.`);
};

module.exports.View = View;
