const esbuild = require('esbuild')

const options = {
    bundle: true,
    minify: true,
    sourcemap: 'external',
    sourcesContent: false,
    logLevel: 'error'
}

const ARGS = process.argv.slice(2)

async function bundleScripts() {
    const entryPoints = {
        rack: 'js/rack.js',
    }

    try {
        const result = await esbuild.build({
            ...options,
            outdir: '../static/netbox_reorder_rack/js/',
            entryPoints,
            target: 'es2016'
        })
        if (result.errors.length !== 0) return

        for (const [targetName, sourceName] of Object.entries(entryPoints)) {
            const source = sourceName.split('/').pop() // take last element
            console.log(
                `✅ Bundled source file '${source}' to '${targetName}.js'`
            )
        }
    } catch (err) {
        console.error(err)
    }
}

async function bundleStyles() {
    try {
        const entryPoints = {
            rack: 'css/rack.css',
        }

        // The styles are plain CSS, which esbuild bundles and minifies natively. There is
        // no Sass plugin: it pulled in sass -> chokidar -> braces/picomatch and
        // sass -> immutable purely as build-time dependencies, all of which carried
        // advisories, for a stylesheet that uses no Sass features. If .scss is ever needed
        // here, reintroduce a Sass plugin at that point.
        const result = await esbuild.build({
            ...options,
            outdir: '../static/netbox_reorder_rack/css/',
            // Disable sourcemaps for CSS files, see #7068
            sourcemap: false,
            entryPoints,
            loader: {
                '.eot': 'file',
                '.woff': 'file',
                '.woff2': 'file',
                '.svg': 'file',
                '.ttf': 'file'
            }
        })
        if (result.errors.length === 0) {
            for (const [targetName, sourceName] of Object.entries(
                entryPoints
            )) {
                const source = sourceName.split('/')[1]
                console.log(
                    `✅ Bundled source file '${source}' to '${targetName}.css'`
                )
            }
        }
    } catch (err) {
        console.error(err)
    }
}

async function bundleAll() {
    if (ARGS.includes('--styles')) {
        // Only run style jobs.
        return await bundleStyles()
    }
    if (ARGS.includes('--scripts')) {
        // Only run script jobs.
        return await bundleScripts()
    }
    await bundleStyles()
    await bundleScripts()
}

bundleAll()
