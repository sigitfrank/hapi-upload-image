const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const fs = require('fs')
const Path = require('path')

const server = Hapi.Server({
    port: 5000,
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    },
})
const handleFileUpload = (file, filename) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(`./public/assets/${Date.now()}-${filename}`, file, err => {
            if (err) reject(err)
            resolve({ message: 'Upload successfully!' })
        })
    })
}

const init = async () => {
    await server.register(Inert)
    server.route({
        method: 'GET',
        path: '/image/{filename}',
        handler: function (request, h) {
            const { filename } = request.params
            return h.file(`./assets/${filename}`);
        }
    });
    server.route({
        path: '/upload',
        method: 'POST',
        config: {
            payload: {
                maxBytes: 1024 * 1024 * 5,
                output: 'file',
                parse: true,
                multipart: true,
                allow: 'multipart/form-data'
            },
            handler: async (req, h) => {
                const { payload } = req
                const bufferFile = fs.promises.readFile(payload.image.path);
                const response = await bufferFile.then((buffer) => handleFileUpload(buffer, payload.image.filename)
                );
                return response
            }
        }

    })
    await server.start()
    console.log('Server running on %s', server.info.uri)
}
init()