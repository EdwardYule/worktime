import { getLastMonth, getAllFolder, execRepo } from '../utils/utils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { since, until } = getLastMonth();
console.log(since, until);
const gitCommand = `git log --since="${since}" --until="${until}" --oneline --pretty=format:%cd --date=format:%d --author=Edward`;
const rootDirs = ['../Edward'];
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
    
    // 构建要保存的输出结果
    let outputContent = `${since} ${until}\n\n`;
    
    // 添加每个仓库的统计信息
    result.forEach(e => {
        const percentage = Math.round((e.length / total) * 100);
        outputContent += `${e.repo} ${percentage}%\n`;
        console.log(e.repo, `${percentage}%`);
    });

    // 保存结果到文件
    const savePath = path.resolve(__dirname, '../../data/weekResult.txt');
    fs.writeFileSync(savePath, outputContent, 'utf8');
    console.log('Results saved to data/weekResult.txt');
});