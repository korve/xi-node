const {XI_CORE_PATH} = process.env;
const { createClient } = require('./client');

(async () => {
    const client = await createClient(XI_CORE_PATH);
    const view = await client.newView();
    view.save('/Users/andre/test.txt');
})();
