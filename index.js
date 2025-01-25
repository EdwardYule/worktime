const { exec } = require('child_process');

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

// 构建 git log 命令
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd --date=format:%d`;

// 执行 git log 命令
exec(gitCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`执行 Git 命令时出错: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Git 命令输出错误信息: ${stderr}`);
        return;
    }
    const dateList = [...new Set(stdout.split('\n'))];
    console.log(`${dateList} length: ${dateList.length}`);
});