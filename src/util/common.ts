/**
 * 工具函数：将字符串首字母大写
 * 用于生成类型名称
 */
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

