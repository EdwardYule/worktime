const { exec, execSync } = require('child_process');
const { getDate, findGitRepositories } = require('./utils');

const { since, until } = getDate();
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd --date=format:%d`;
const execRepo = (repo) => {
    exec(gitCommand, { cwd: repo }, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行 Git 命令时出错: ${error.message}`);
            execSync(`git config --global --add safe.directory ${repo}`);
            return;
        }
        if (stderr) {
            console.error(`Git 命令输出错误信息: ${stderr}`);
            return;
        }
        const dateList = [...new Set(stdout.split('\n'))];
        console.log(`${repo}: ${dateList} ${dateList[0]} length: ${dateList.length}`);
    });
}

const rootDirectory = '../Edward';
const gitRepos = findGitRepositories(rootDirectory);
gitRepos.forEach(repo => {
    execRepo(repo);
});