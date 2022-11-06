const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const getSize = (code) => ((code.length / 1024).toFixed(2) + 'kb')

module.exports.createFolder = (folder) => {
    const dir = path.join(__dirname, '..', folder)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

module.exports.writeFile = (dest, code, zip) => {
    const banner = dest.indexOf('.json') > -1
        ? ('[json]')
        : dest.indexOf('.js') > -1
            ? ('[js]  ')
            : dest.indexOf('.ts') > -1
                ? ('[ts]  ')
                : ('[css] ')

    return new Promise((resolve, reject) => {
        function report(extra) {
            console.log(`${banner} ${path.relative(process.cwd(), dest).padEnd(41)} ${getSize(code).padStart(8)}${extra || ''}`)
            resolve(code)
        }

        fs.writeFile(dest, code, err => {
            if (err) return reject(err)
            if (zip) {
                zlib.gzip(code, (err, zipped) => {
                    if (err) return reject(err)
                    report(` (gzipped: ${getSize(zipped).padStart(8)})`)
                })
            } else {
                report()
            }
        })
    })
}

module.exports.readFile = (file) => fs.readFileSync(file, 'utf-8')

module.exports.logError = (err) => {
    console.error('\n' + ('[Error]'), err)
    console.log()
}
