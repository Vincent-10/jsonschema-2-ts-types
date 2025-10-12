import { capitalizeFirstLetter } from './common'
import { SchemaProperty, Schema } from '@/types/schema'

/**
 * 根据路径前缀生成输出文件路径
 * @param prefix 路径前缀
 * @returns 文件名
 */
export const generateOutputFileName = (filePath: string): string => {
  // 移除开头的斜杠，将其他 \ 和 - 替换为下划线
  const sanitizedPrefix = filePath.replace(/^\//, '').replace(/[/\-]+/g, '_');
  return `${sanitizedPrefix}_types.ts`;
}

/**
 * 路径转换成接口名称
 * @param path - 路径
 * @param method - 请求方法
 * @param isRequest - 是否请求，默认是响应
 * @returns 接口名称
 */
export const pathToInterfaceName = (path: string, method: string, isRequest?: boolean): string => {
  isRequest = isRequest ?? false
  // 把路径中{}已经里面的内容替换成空字符串，然后按 / 和 - 分割，去掉空字符串
  const subPaths = path
    .replace(/\{[^{}]*\}/g, '')
    .split(/[/\-]+/)
    .filter(Boolean)
  return [method, ...subPaths, isRequest ? 'Request' : 'Response']
    .map(subPath => capitalizeFirstLetter(subPath))
    .join('')
}

/**
 * 从引用路径中提取类型名称
 * 例如：从 "#/definitions/User" 提取 "User"
 */
const getTypeFromRef = (ref: string): string => {
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

/**
 * 生成 TypeScript 接口定义
 * @param name - 接口名称
 * @param schema - Schema 定义
 * @returns 完整的接口定义字符串
 */
export const generateInterface = (name: string, schema: Schema): string => {
  const description = schema.description ? `/** ${schema.description} */\n` : '';
  return `${description}export interface ${name} {
${Object.entries(schema?.properties ?? {})
          .map(([key, prop]) => {
              const isRequired = schema.required?.includes(key); // 处理是否必选
              const typeStr = convertType(prop); // 转换类型
              const description = prop.description ? `  /** ${prop.description} */\n` : ''; // 处理注释
              return `${description}  ${key}${isRequired ? '' : '?'}: ${typeStr};`;
          })
          .join('\n')}
}`;
}


/**
 * 核心函数：将 JSON Schema 的类型转换为 TypeScript 类型
 * @param prop - Schema 属性定义
 * @returns TypeScript 类型定义字符串
 */
export const convertType = (prop: SchemaProperty): string => {
  // 处理引用类型（$ref）
  if (prop.$ref) {
      return getTypeFromRef(prop.$ref);
  }

  // 处理继承（allOf）
  if (prop.allOf && prop.allOf[0]?.$ref) {
      return getTypeFromRef(prop.allOf[0].$ref);
  }

  // 处理数组类型
  if (prop.type === 'array') {
      if (prop.items) {
          return `${convertType(prop.items)}[]`;
      }
      return 'any[]';
  }

  // 处理 Record 类型（具有动态属性的对象）
  if (prop.type === 'object' && prop.additionalProperties) {
      if (prop.additionalProperties.$ref) {
          return `Record<string, ${getTypeFromRef(prop.additionalProperties.$ref)}>`;
      }
      return 'Record<string, any>';
  }

  // 处理基本类型和对象类型
  switch (prop.type) {
      case 'integer':
          return 'number';
      case 'string':
          return 'string';
      case 'boolean':
          return 'boolean';
      case 'object':
          if (prop.properties) {
              // 处理嵌套对象，递归生成属性
              return `{\n${Object.entries(prop.properties)
                  .map(([key, value]) => {
                      const isRequired = prop.required?.includes(key);
                      const typeStr = convertType(value);
                      const description = value.description ? `  /** ${value.description} */\n` : '';
                      return `${description}  ${key}${isRequired ? '' : '?'}: ${typeStr};`;
                  })
                  .join('\n')}\n}`;
          }
          return 'Record<string, any>';
      default:
          return 'any';
  }
}

/**
 * 核心函数：生成所有 TypeScript 类型定义
 * @param jsonSchema - 完整的 JSON Schema 对象
 * @returns 所有类型定义的字符串
 */
export const generateTypes = (jsonSchema: any): string => {
  let output = '';

  // 1. 处理 definitions 部分
  if (jsonSchema.definitions) {
      Object.entries(jsonSchema.definitions).forEach(([name, schema]: [string, any]) => {
          output += generateInterface(name, schema as Schema) + '\n\n';
      });
  }

  // 2. 处理 components.schemas 部分
  if (jsonSchema.components?.schemas) {
      Object.entries(jsonSchema.components.schemas).forEach(([name, schema]: [string, any]) => {
          output += generateInterface(name, schema as Schema) + '\n\n';
      });
  }

  // 3. 处理 API 路径，生成请求和响应类型
  if (jsonSchema.paths) {
      Object.entries(jsonSchema.paths).forEach(([path, pathObj]: [string, any]) => {
          Object.entries(pathObj).forEach(([method, operation]: [string, any]) => {
              // 3.1 生成请求参数接口
              if (operation.parameters) {
                  const reqParams: { [key: string]: SchemaProperty } = {};
                  operation.parameters.forEach((param: any) => {
                      reqParams[param.name] = {
                          ...param.schema,
                          description: param.description
                      };
                  });

                  const title = pathToInterfaceName(path, method, true)
                  const reqInterface = {
                      type: 'object',
                      properties: reqParams,
                      required: operation.parameters
                          .filter((p: any) => p.required)
                          .map((p: any) => p.name),
                      title,
                  };

                  output += generateInterface(reqInterface.title, reqInterface) + '\n\n';
              }

              // 3.2 生成响应接口
              if (operation.responses?.[200]?.content?.['application/json']?.schema) {
                  const respSchema = operation.responses[200].content['application/json'].schema;
                  if (respSchema.$ref) {
                      // 如果响应是引用类型，跳过（因为已经在 definitions 或 components.schemas 中定义）
                      return;
                  }

                  const title = pathToInterfaceName(path, method, false)
                  const respInterface = {
                      ...respSchema,
                      title
                  };

                  output += generateInterface(respInterface.title, respInterface) + '\n\n';
              }
          });
      });
  }

  return output;
}