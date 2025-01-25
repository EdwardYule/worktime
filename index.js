const { exec, execSync } = require('child_process');
const { getDate, findGitRepositories } = require('./utils');
const path = require('path');

const { since, until } = getDate();
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd --date=format:%d --author=Edward`;
const execRepo = (cwd, rootDir) => {
    return new Promise((resolve, reject) => {
        exec(gitCommand, { cwd }, (error, stdout, stderr) => {
            const repo = path.resolve(__dirname, rootDir, cwd).replace(/\\/g, '/');
            if (error) {
                console.error(`${repo} 执行 Git 命令时出错: ${error.message}`);
                execSync(`git config --global --add safe.directory ${repo}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Git 命令输出错误信息: ${stderr}`);
                reject(stderr);
                return;
            }
            const dateList = [...new Set(stdout.split('\n').filter(e => e !== ''))];
            resolve({repo, dateList, length: dateList.length});
        });
    })
}

const rootDirs = ['../Edward', '../RecadasServer', '../wiseRental'];
const allFolders = [];
rootDirs.forEach(rootDir => {
    const folder = findGitRepositories(rootDir);
    allFolders.push(...folder.map(e => ({ repo: e, rootDir })));
})

Promise.all(allFolders.map(item => execRepo(item.repo, item.rootDir))).then((res) => {
    const result = res.filter(e => e.dateList.length > 0);
    const total = result.reduce((a, b) => a + b.length, 0);
    result.forEach(e => console.log(e.repo, e.dateList, e.length, `${Math.round((e.length / total) * 10000) / 100}%`));
    // console.log(total, result)
    console.log('All done!')
});