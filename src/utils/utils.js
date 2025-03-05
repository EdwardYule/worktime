import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';

/**
 * @returns {{since: string, until: string}}
 */
const getThisMonth = () => {
    // 获取当前日期
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // JavaScript 中月份从 0 开始，所以要加 1

    // 计算本月的最后一天
    const lastDay = new Date(year, month, 0).getDate();

    // 格式化月份和最后一天为两位数
    const formattedMonth = String(month).padStart(2, '0');
    const formattedLastDay = String(lastDay).padStart(2, '0');

    // 构建日期范围
    const since = `${year}-${formattedMonth}-01`;
    const until = `${year}-${formattedMonth}-${formattedLastDay}`;

    return { since, until };
}

/**
 * @returns {{since: string, until: string}}
 */
const getThisWeek = () => {
    const currentDate = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() + 1);
    const lastDay = new Date(firstDay.getTime() + 6 * 24 * 60 * 60 * 1000);

    const formattedFirstDay = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
    const formattedLastDay = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    return { since: formattedFirstDay, until: formattedLastDay };
}

/**
 * @returns {{since: string, until: string}}
 */
const getLastWeek = () => {
    const currentDate = new Date();
    // 获取上周一
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay() - 6);
    // 获取上周日
    const lastDay = new Date(firstDay.getTime() + 6 * 24 * 60 * 60 * 1000);

    const formattedFirstDay = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
    const formattedLastDay = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    return { since: formattedFirstDay, until: formattedLastDay };
}

/**
 * @returns {{since: string, until: string}}
 */
const getLastMonth = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // 格式化月份和最后一天为两位数
    const formattedMonth = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    const formattedLastDay = String(lastDay).padStart(2, '0');

    return {
        since: `${year}-${formattedMonth}-01`,
        until: `${year}-${formattedMonth}-${formattedLastDay}`
    };
}

/**
 * @param {string} rootDir
 * @returns {string[]}
 */
function findGitRepositories(rootDir) {
    const repositories = [];

    function traverseDirectory(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    if (entry.name === '.git') {
                        // 找到 .git 目录，将其父目录视为 Git 仓库
                        repositories.push(dir);
                        // 不再递归遍历该仓库的子目录
                        return;
                    } else {
                        // 递归遍历子目录
                        traverseDirectory(fullPath);
                    }
                }
            }
        } catch (err) {
            console.error(`遍历目录 ${dir} 时出错:`, err);
        }
    }

    traverseDirectory(rootDir);
    return repositories;
}

/**
 * @param {string[]} dirs
 * @returns {{repo: string, rootDir: string}[]}
 */
const getAllFolder = (dirs = []) => {
    const allFolders = [];
    dirs.forEach(rootDir => {
        const folder = findGitRepositories(rootDir);
        allFolders.push(...folder.map(e => ({ repo: e, rootDir })));
    })
    return allFolders;
}

/**
 * @param {string} cwd
 * @param {string} rootDir
 * @param {string} cmd
 * @returns {Promise<{repo: string, stdout: string}>}
 */
const execRepo = (cwd, rootDir, cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, { cwd }, (error, stdout, stderr) => {
            const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), rootDir, cwd).replace(/\\/g, '/');
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
            resolve({repo, stdout});
        });
    })
}

export {
    getThisMonth,
    getThisWeek,
    getLastWeek,
    getLastMonth,
    findGitRepositories,
    getAllFolder,
    execRepo,
}
