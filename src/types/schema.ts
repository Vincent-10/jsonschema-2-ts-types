/**
 * 定义 JSON Schema 属性的接口
 * 用于描述 JSON Schema 中的每个属性的结构
 */
export interface SchemaProperty {
    type: string;                                     // 属性类型（string, number, boolean 等）
    description?: string;                             // 属性描述（用于生成注释）
    title?: string;                                   // 属性标题
    items?: any;                                      // 数组项的类型定义
    $ref?: string;                                    // 引用其他类型的路径
    additionalProperties?: any;                       // 额外属性的类型定义（用于 Record 类型）
    properties?: { [key: string]: SchemaProperty };   // 嵌套对象的属性
    required?: string[];                              // 必需字段列表
    allOf?: any[];                                    // 类型组合（继承）
    default?: any;                                    // 默认值
}

/**
 * 定义完整的 Schema 接口
 * 用于描述一个完整的类型定义
 */
export interface Schema {
    type: string;
    properties: { [key: string]: SchemaProperty };
    required?: string[];
    title: string;
    description?: string;
}