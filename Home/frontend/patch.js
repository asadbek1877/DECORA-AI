const fs = require('fs');
let code = fs.readFileSync('src/store/languageStore.ts', 'utf8');

code = code.replace(/    admin: "РђРґРјРёРЅ",\n  \},/g, '    admin: "РђРґРјРёРЅ",\n    nameOptional: "Имя (Необязательно)",\n    yourGenerations: "Ваши генерации",\n    filter: "Фильтр",\n    filterByStyle: "Фильтр по стилю",\n  },');

code = code.replace(/    admin: "Admin",\n  \},/g, '    admin: "Admin",\n    nameOptional: "Name (Optional)",\n    yourGenerations: "Your Generations",\n    filter: "Filter",\n    filterByStyle: "Filter by Style",\n  },');

code = code.replace(/    admin: "з®Ўзђ†иЂ…",\n  \}\n\};/g, '    admin: "з®Ўзђ†иЂ…",\n    nameOptional: "名前 (任意)",\n    yourGenerations: "あなたの生成物",\n    filter: "フィルター",\n    filterByStyle: "スタイルで絞り込む",\n  }\n};');

fs.writeFileSync('src/store/languageStore.ts', code);
