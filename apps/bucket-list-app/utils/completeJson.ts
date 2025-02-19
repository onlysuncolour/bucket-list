// prompt:
// 帮我用typescript写一个补全JSON字符串并返回object的方法
// 要实现以下的目标：
// 1. 如果 key 不完整，或 key后面无值，则补全这个key，并且赋值null。这个情况只可能会发生在字符串最后。
//     举例：'{..."na' =>  '{..."na":null', '{..."na"' => '{..."na": null', '{..."na":'  => '{..."na":null'
// 2. 如果 value 不完整，则补全，如{"name": "b 补全成 {"name":"b},数值类型的直接使用，boolean、null 给补全
// 3. 一定要补全所有的大括号、中括号等！
// 4. 可能头会出现 ```JSON 尾会出现 ```,中间会出现很多 \n，结尾可能不完整，导致是个,
// 5. 最后的结果一定是一个object/array
// 6. 请记住，输入的不完整的字符串，是从 一个完整的json字符串（或用```包住的json），从头开始到中间或结尾截取的字符串。

export function completeJSON(input: string): object | Array<any> {
    let str = preprocess(input);
    str = completeKeyAndValue(str);
    str = completeBrackets(str);
    str = fixTrailingComma(str);
    
    return JSON.parse(str);
}

function preprocess(s: string): string {
    // 去除头尾的```和换行
    return s.replace(/^```(json)?|```$/g, '')
           .replace(/\n/g, ' ')
           .trim();
}

function completeKeyAndValue(s: string): string {
    // 处理未闭合的键
    const keyRegex = /(?:{|,)\s*"([^"\\]*(\\.[^"\\]*)*)$/;
    if (keyRegex.test(s)) {
        s += '":null';
    }

    // 处理以冒号结尾的情况
    const colonEndRegex = /:\s*$/;
    if (colonEndRegex.test(s)) {
        s += 'null';
    }

    // 处理未闭合的字符串值
    const stringRegex = /(?<!\\)"([^"\\]*(\\.[^"\\]*)*)$/;
    if ((s.match(/"/g) || []).length % 2 !== 0) {
        s += '"';
    }

    // 补全布尔/null值
    const partialValueMatch = s.match(/(true|false|null|tr?u?e?|fa?l?s?e?|nu?l?l?)$/);
    if (partialValueMatch) {
        const val = partialValueMatch[0];
        if (val.startsWith('t')) s += 'rue'.slice(val.length);
        else if (val.startsWith('f')) s += 'alse'.slice(val.length);
        else if (val.startsWith('n')) s += 'ull'.slice(val.length);
    }

    return s;
}

function completeBrackets(s: string): string {
    const stack: string[] = [];
    const pairs: { [key: string]: string } = { '{': '}', '[': ']' };

    for (const char of s) {
        if (char === '{' || char === '[') {
            stack.push(pairs[char]);
        } else if (char === '}' || char === ']') {
            if (stack[stack.length - 1] === char) {
                stack.pop();
            }
        }
    }

    return s + stack.reverse().join('');
}

function fixTrailingComma(s: string): string {
    // 移除对象/数组末尾的逗号
    return s.replace(/,(?=\s*[}\]])/g, '');
}
