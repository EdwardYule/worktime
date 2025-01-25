const getDate = () => {
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

const fs = require('fs');
const path = require('path');

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

module.exports = {
    getDate,
    findGitRepositories
}