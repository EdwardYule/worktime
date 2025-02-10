const path = require('path');
const { getThisWeek, getAllFolder, execRepo } = require('../utils/utils');

const { since, until } = getThisWeek();
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd:%s --date=format:%Y-%m-%d --author=Edward`;
const rootDirs = ['../Edward', '../RecadasServer', '../wiseRental'];
const allFolders = getAllFolder(rootDirs);

Promise.all(allFolders.map(item => execRepo(item.repo, item.rootDir, gitCommand))).then((_res) => {
    const result = _res.filter(e => e.stdout !== '').map(e => {
        return {
            repo: e.repo,
            stdout: e.stdout.split('\n').filter(e => e !== ''),
        }
    });
    const fs = require('fs');
    const filePath = path.join(__dirname, 'weekResult.json');
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
});