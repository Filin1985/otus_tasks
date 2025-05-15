const fs = require('fs/promises');
const path = require('path');

async function buildTree(rootDir, maxDepth, currentDepth = 0, prefix = '') {
    if (currentDepth > maxDepth) return;

    try {
        const items = await fs.readdir(rootDir);
        const stats = await Promise.all(items.map(item => 
            fs.stat(path.join(rootDir, item))
        ));

        let dirCount = 0;
        let fileCount = 0;
        const entries = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const stat = stats[i];
            const isLast = i === items.length - 1;

            if (stat.isDirectory()) {
                dirCount++;
                entries.push({ name: item, isDirectory: true, isLast });
            } else if (stat.isFile()) {
                fileCount++;
                entries.push({ name: item, isDirectory: false, isLast });
            }
        }

        for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const connector = entry.isLast ? '└── ' : '├── ';
            console.log(prefix + connector + entry.name);

            if (entry.isDirectory) {
                const newPrefix = prefix + (entry.isLast ? '    ' : '│   ');
                const childDir = path.join(rootDir, entry.name);
                const counts = await buildTree(childDir, maxDepth, currentDepth + 1, newPrefix);
                dirCount += counts.dirs;
                fileCount += counts.files;
            }
        }

        return { dirs: dirCount, files: fileCount };
    } catch (err) {
        console.error(`Error reading directory: ${rootDir}`, err);
        return { dirs: 0, files: 0 };
    }
}

async function main() {
    const args = process.argv.slice(2);
    let dirPath = '.';
    let depth = Infinity;

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--depth' || arg === '-d') {
            if (i + 1 < args.length) {
                depth = parseInt(args[i + 1]);
                if (isNaN(depth) || depth < 0) {
                    console.error('Depth must be a non-negative integer');
                    process.exit(1);
                }
                i++;
            } else {
                console.error('Depth value missing');
                process.exit(1);
            }
        } else if (!arg.startsWith('-')) {
            dirPath = arg;
        }
    }

    try {
        const absolutePath = path.resolve(dirPath);
        console.log(absolutePath);
        const counts = await buildTree(absolutePath, depth);
        console.log(`\n${counts.dirs} directories, ${counts.files} files`);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

main();