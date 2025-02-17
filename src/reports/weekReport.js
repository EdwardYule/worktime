import path from 'path';
import { getThisWeek, getAllFolder, execRepo, getLastWeek } from '../utils/utils.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { since, until } = getLastWeek();
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
    const filePath = path.join(__dirname, '../../data/weekResult.json');
    
    // 确保 data 目录存在
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
    console.log('周报数据已保存到：', filePath);
});