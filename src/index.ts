import fs from 'fs-extra';
import { generate } from '@/generate';
import request from 'request-promise-native';
import logger from '@/util/logger';

/**
 * 主函数：程序入口
 * 处理命令行参数并执行转换
 */
async function main() {
  try {
    // 获取输入文件路径
    const inputPath = process.argv[2];

    if (!inputPath) {
      throw new Error('请提供本地JSON文件路径或者远程JSON数据请求url作为参数');
    }

    const isUrl = inputPath.startsWith('http');

    // 读取并解析 JSON Schema 文件
    let jsonString = await (isUrl
      ? request.get(inputPath)
      : fs.readFile(inputPath, {
          encoding: 'utf-8',
        }));

    await generate({
      jsonString,
      filterPathPrefix: ['/jellyplus-admin/channel-backend', '/easepublish-app/resource'],
      isDirFlat: true,
    });
  } catch (error: any) {
    logger.error('Error:', error.message);
    process.exit(1);
  }
}

main();
