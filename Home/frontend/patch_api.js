const fs = require('fs');
let code = fs.readFileSync('src/api/client.ts', 'utf8');

const injection = '  async getAppSettings(): Promise<ApiResponse<any>> {\n' +
'    return this.request<any>(\'/admin/settings\');\n' +
'  }\n\n' +
'  async updateAppSettings(data: { beforeImageUrl?: string, afterImageUrl?: string }): Promise<ApiResponse<any>> {\n' +
'    return this.request<any>(\'/admin/settings\', {\n' +
'      method: \'PUT\',\n' +
'      body: JSON.stringify(data),\n' +
'    });\n' +
'  }\n';

code = code.replace(/async updateProfile\(/, injection + '\n  async updateProfile(');
fs.writeFileSync('src/api/client.ts', code);
