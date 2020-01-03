/**
 * The frontend protocol messages
 * @see https://xi-editor.io/xi-editor/docs/frontend-protocol.html
 */

const assert = require("assert").strict;

function client_started(config_dir = null, client_extras_dir = null) {
    return createMessage('client_started', {config_dir, client_extras_dir});
}

function new_view(file_path = null) {
    return createMessage('new_view', {file_path});
}

function close_view(view_id) {
    assert(view_id);
    return createMessage('close_view', {view_id});
}

function save(view_id, file_path) {
    assert(view_id);
    assert(file_path);
    return createMessage('save', {view_id, file_path});
}

function setTheme(theme_name) {
    assert.equal(typeof theme_name, 'string', 'theme_name is not a string');
    return createMessage('set_theme', {theme_name});
}

function setLanguage(view_id, language_id) {
    assert(view_id);
    assert.equal(typeof language_id, 'string', 'language_id is not a string');
    return createMessage('set_language', {view_id, language_id});
}

function modifyUserConfig(domain, changes) {
    assert(domain);
    assert(changes);
    return createMessage('modify_user_config', {domain, changes});
}

function getConfig(view_id) {
    assert(view_id);
    return createMessage('get_config', {view_id});
}

function insertChars(view_id, chars) {
    assert(view_id);
    assert(chars);
    return createEditMessage("insert", view_id, {chars});
}

function paste(view_id, chars) {
    assert(view_id);
    assert(chars);
    return createEditMessage("paste", view_id, {chars});
}

function copy(view_id) {
    assert(view_id);
    return createEditMessage("copy", view_id);
}

function cut(view_id) {
    assert(view_id);
    return createEditMessage("cut", view_id);
}

function scroll(view_id, scroll) {
    assert(view_id);
    assert(scroll);
    return createEditMessage("scroll", view_id, scroll);
}

function resize(view_id, size) {
    assert(view_id);
    assert(size);
    assert(size.width !== undefined);
    assert(size.height !== undefined);
    return createEditMessage("resize", view_id, {resize});
}

function gesture(view_id, gesture) {
    assert(view_id);
    assert(gesture);
    return createEditMessage("resize", view_id, {gesture});
}

function gotoLine(view_id, line) {
    assert(view_id);
    assert(size);
    assert(size.width !== undefined);
    assert(size.height !== undefined);
    return createEditMessage("goto_line", view_id, {line});
}

const additionalCommands = require('./commands').map((method) => {
    return function (view_id) {
        return createEditMessage(method, view_id);
    }
});

/**
 * Helper method to create a RPC message
 * @see https://xi-editor.io/xi-editor/docs/frontend-protocol.html#from-front-end-to-back-end
 *
 * @param {string} method
 * @param {*} params
 * @return {{method: string, params: Object}}
 */
function createMessage(method, params) {
    return {
        method,
        params
    }
}

/**
 * Helper method to create RPC messages from the edit namespace
 * @see https://xi-editor.io/xi-editor/docs/frontend-protocol.html#edit-namespace
 * @param {string} method
 * @param {*} params
 * @param {string} view_id
 * @return {{method: string, params: {method: string, params: Object, view_id: string}}}
 */
function createEditMessage(method, view_id, params = {}) {
    return createMessage("edit", {
        method,
        view_id,
        params
    })
}

module.exports = {
    client_started,
    new_view,
    close_view,
    save,
    setTheme,
    setLanguage,
    modifyUserConfig,
    getConfig,

    // edit namespace
    insertChars,
    paste,
    copy,
    cut,
    scroll,
    resize,
    gesture,
    gotoLine,

    // additional commands without any parameters that act on the current selection
    ...additionalCommands
};
