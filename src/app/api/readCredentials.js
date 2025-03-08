import { readFile } from 'node:fs/promises';
const phpFilePath = 'c:/inetpub/wwwroot/nrcscred.php'; //absolute path to the php file
// const phpFilePath = '../../nrcscred.php'; //absolute path to the php file

const readCredentials = async () => {
    try {
        const data = await readFile(phpFilePath, 'utf-8');
        const matches = data.match(/\$(\w+)\s*=\s*(["']?)(.*?)\2;/g);

        if (matches) {
            const variables = matches.reduce((acc, match) => {
                const [, key, , value] = match.match(/\$(\w+)\s*=\s*(["']?)(.*?)\2;/);
                acc[key] = value;
                return acc;
            }, {});

            const mysqlConfig = {
                host: variables.servername,
                user: variables.username,
                password: variables.password,
                database: variables.dbname,
                connectTimeout: 20000, // 20 seconds
            };

            return { mysqlConfig };
        }
    } catch (err) {
        console.error('Error reading PHP file:', err);
        throw err; // Rethrow the error for handling at a higher level if needed
    }
};

export default readCredentials;
