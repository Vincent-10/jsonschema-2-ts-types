import fs from 'fs-extra';
import path from 'path';
import { generateTypes, generateOutputFileName } from '@/util/transform';

interface GenerateOption {
  inputFilePath: string;
  filterPathPrefix?: string[];
  isDirFlat?: boolean; // 是否打平目录结构，默认打平
}

/**
 * 过滤 JSON Schema 中的路径
 * @param jsonSchema 原始 JSON Schema
 * @param filterPathPrefix 需要过滤的路径前缀数组
 * @returns 过滤后的 JSON Schema
 */
function filterPaths(jsonSchema: any, filterPathPrefix: string[]): any {
  if (!jsonSchema.paths || filterPathPrefix.length === 0) {
    return jsonSchema;
  }

  const filteredPaths: any = {};

  // 遍历所有路径
  Object.entries(jsonSchema.paths).forEach(([path, pathContent]) => {
    // 检查路径是否匹配任一前缀
    const isMatchPrefix = filterPathPrefix.some(prefix => 
      path.startsWith(prefix)
    );

    if (isMatchPrefix) {
      filteredPaths[path] = pathContent;
    }
  });

  // 创建新的 JSON Schema，只包含过滤后的路径
  return {
    ...jsonSchema,
    paths: filteredPaths
  };
}

/**
 * 处理生成ts文件
 */
export async function generate(option: GenerateOption) {
  const { 
    inputFilePath, 
    filterPathPrefix = [], 
    isDirFlat = true 
  } = option;

  if (!inputFilePath) {
    throw new Error('Please provide an input JSON Schema file');
  }

  // 读取并解析 JSON Schema 文件
  const jsonSchema = await fs.readJSON(inputFilePath, {
    encoding: 'utf-8',
  });

  // 创建输出目录
  const outputFilePathPrefix = path.resolve(process.cwd(), 'dist');
  await fs.remove(outputFilePathPrefix);
  await fs.ensureDir(outputFilePathPrefix);

  if (Array.isArray(filterPathPrefix) && filterPathPrefix.length > 0) {
    // 为每个路径前缀生成单独的类型文件
    for (const prefix of filterPathPrefix) {
      // 过滤指定前缀的路径
      const filteredSchema = filterPaths(jsonSchema, [prefix]);
      
      // 生成类型定义
      const typeDefinitions = generateTypes(filteredSchema);

      // 根据前缀生成输出文件名
      const outputFileName = isDirFlat 
        ? generateOutputFileName(prefix)
        : path.resolve(outputFilePathPrefix, ...prefix.replace(/^\//, '').split(/\//), 'type.ts');
      
      const outputFilePath = path.resolve(outputFilePathPrefix, outputFileName);

      // 写入输出文件
      await fs.ensureFile(outputFilePath);
      await fs.writeFile(outputFilePath, typeDefinitions);
      console.log(`Successfully generated TypeScript types for prefix ${prefix} in ${outputFilePath}`);
    }
  } else {
    // 不过滤，生成所有类型
    const typeDefinitions = generateTypes(jsonSchema);
    const outputFilePath = path.resolve(outputFilePathPrefix, 'types.ts');

    // 写入输出文件
    await fs.ensureFile(outputFilePath);
    await fs.writeFile(outputFilePath, typeDefinitions);
    console.log(`Successfully generated TypeScript types in ${outputFilePath}`);
  }
}