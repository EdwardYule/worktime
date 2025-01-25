const { getThisMonth, getAllFolder, execRepo } = require('./utils');

const { since, until } = getThisMonth();
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd --date=format:%d --author=Edward`;
const rootDirs = ['../Edward', '../RecadasServer', '../wiseRental'];
const allFolders = getAllFolder(rootDirs);

// 统计工时
Promise.all(allFolders.map(item => execRepo(item.repo, item.rootDir, gitCommand))).then((_res) => {
    const res = _res.map(item => {
        const dateList = item.stdout.split('\n').filter(e => e !== '');
        return {
            ...item,
            dateList,
            length: dateList.length
        }
    })
    const result = res.filter(e => e.dateList.length > 0);
    const total = result.reduce((a, b) => a + b.length, 0);
    result.forEach(e => console.log(
        e.repo,
        // e.dateList,
        // e.length,
        `${Math.round((e.length / total) * 100)}%`
    ));
    // console.log(total, result)
});