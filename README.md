# JSON Schema to TypeScript Types Converter

这个工具可以将 JSON Schema 文件转换为 TypeScript 类型定义。它支持：

- 自动生成接口定义
- 保留字段描述作为注释
- 处理嵌套类型
- 支持引用类型
- 生成请求和响应类型

## 安装

```bash
npm install
```

## 使用方法

```bash
npx ts-node src/index.ts <input-json-schema-file> [output-ts-file]
```

例如：

```bash
npx ts-node src/index.ts example.json types.ts
```

如果不指定输出文件，将使用输入文件名（改变扩展名为 .ts）作为输出文件名。

## 功能特点

1. 支持 JSON Schema 的主要特性：
   - 基本类型（string, number, boolean, array, object）
   - 引用类型（$ref）
   - 必填字段（required）
   - 描述信息（description）

2. 生成的 TypeScript 类型包括：
   - 接口定义
   - 字段注释（来自 description）
   - 可选字段标记（?）
   - 数组类型
   - 嵌套对象类型

3. 特殊处理：
   - OpenAPI/Swagger 路径参数
   - 请求和响应类型
   - 组件和定义

## 注意事项

- 确保输入的 JSON Schema 文件格式正确
- 生成的类型文件可能需要手动调整一些特殊情况
- 复杂的验证规则（如 pattern、minimum 等）不会转换为类型约束