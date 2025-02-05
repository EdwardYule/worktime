import OpenAI from "openai";
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
    apiKey: "sk-6e8d1897c54c4ebea47236eebe789682",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// 读取 weekResult.json 文件
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const weekResultPath = path.join(__dirname, 'weekResult.json');
const weekResult = JSON.parse(fs.readFileSync(weekResultPath, 'utf-8'));

// 调用通义千问 API 进行总结
async function summarizeCommits(commits) {
    const prompt = `请根据以下提交记录生成不超过五项的工作内容总结：\n${commits.join('\n')}`;
    try {
        const completion = await openai.chat.completions.create({
            model: "qwen-plus",
            messages: [
                { role: "user", content: prompt }
            ],
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error calling Aliyun Qwen API:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// 生成工作周报
async function generateWeeklyReport() {
    const report = [];

    for (const repo of weekResult) {
        const summary = await summarizeCommits(repo.stdout);
        report.push(`### ${repo.repo}\n\n${summary}`);
    }

    // 将周报写入文件
    const reportPath = path.join(__dirname, 'weeklyReport.md');
    fs.writeFileSync(reportPath, `# 工作周报\n\n${report.join('\n\n')}`);
    console.log(`工作周报已生成: ${reportPath}`);
}

generateWeeklyReport().catch(console.error);
