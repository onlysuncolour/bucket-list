type JsonSymbolStack = ('}' | ']' | '"')[];

/**
 * 自动补全不完整的JSON字符串，使其成为合法JSON
 * @param partial 不完整的JSON输入
 * @returns 补全后的合法JSON字符串
 */
export function completePartialJSON(partial: string): string {
    // 第一阶段：自动闭合未关闭的符号（{}, [], ""）
    const symbolCompleted = autoCloseSymbols(partial);
    
    // 第二阶段：清理无效键值对
    return cleanInvalidKeys(symbolCompleted);
}

/**
 * 自动闭合未闭合的括号和引号
 */
function autoCloseSymbols(str: string): string {
    const stack: JsonSymbolStack = [];
    let inString = false;
    let escapeNext = false;

    for (const char of str) {
        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        // 处理转义字符
        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        // 处理字符串状态
        if (char === '"') {
            inString = !inString;
            if (inString) {
                stack.push('"');
            } else {
                stack.pop();
            }
            continue;
        }

        if (!inString) {
            // 处理对象/数组开闭
            if (char === '{' || char === '[') {
                stack.push(char === '{' ? '}' : ']');
            } else if (char === '}' || char === ']') {
                const expected = stack.pop();
                if (char !== expected) {
                    stack.push(expected!); // 忽略结构错误，继续处理
                }
            }
        }
    }

    // 补全剩余未闭合符号
    let completed = str;
    while (stack.length > 0) {
        completed += stack.pop();
    }

    return completed;
}

/**
 * 清理无效的键值对（不完整键名或缺失值）
 */
function cleanInvalidKeys(str: string): string {
    // 清理不完整键名（如 "na 未闭合）
    const keyCleanerRegex = /([{,]\s*)"([a-zA-Z_]*?)"?(\s*:?)(\s*)([^"]*?)(\s*)([},]|$)/g;
    let cleaned = str.replace(keyCleanerRegex, (match, lead, key, colonSpaces, _, value, tailSpaces, end) => {
        // Case 1: 键名未闭合（如 "na 没有闭合引号）
        if (!key || (colonSpaces.includes(':') && !value.trim())) {
            return end ? `${lead}${end}` : '';
        }
        
        // Case 2: 键完整但值为空（如 "key": ）
        if (colonSpaces.includes(':') && !value.trim()) {
            return `${lead}"${key}": null${tailSpaces}${end || ''}`;
        }

        return match;
    });

    // 补全未定义值为null（如 "key": unk）
    const valueCleanerRegex = /([{,]\s*"([^"]+)"\s*:\s*)([^}\]][^,]*?)(\s*)([},]|$)/g;
    cleaned = cleaned.replace(valueCleanerRegex, (match, prefix, _, value, space, end) => {
        try {
            // 尝试解析当前值是否合法
            JSON.parse(value.trim());
            return match;
        } catch {
            // 非法值时替换为null
            return `${prefix}null${space}${end}`;
        }
    });

    return cleaned;
}
