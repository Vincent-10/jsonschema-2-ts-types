import { generate } from '@/generate';

/**
 * 主函数：程序入口
 * 处理命令行参数并执行转换
 */
async function main() {
  // 获取输入文件路径
  const inputFile = process.argv[2];

  try {
    generate({
      inputFilePath: inputFile,
      filterPathPrefix: ['/jelly-admin/channel-backend', '/easepublish-app/resource'],
      isDirFlat: true,
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
