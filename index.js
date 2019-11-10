
const ig = require('./instagram');

(async () => {
    await ig.initialize();
    let login, password;

    try {
        login = process.argv[2];
    } catch {
        console.error('Login is missing');
        process.exit();
    }

    try {
        password = process.argv[3];
    } catch {
        console.error('Password is missing');
        process.exit();
    }

    await ig.login(login, password);
    await ig.likeTagsProcess(['cars', 'audirs', 'bmw']);

})();