const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const server = Hapi.Server({ port: 5000 })
const fs = require('fs')


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
                const promise = fs.promises.readFile(payload.image.path);
                const response = await promise.then(function (buffer) {
                    return handleFileUpload(buffer, payload.image.filename)
                });
                return response
            }
        }

    })
    await server.start()
    console.log('Server running on %s', server.info.uri)
}
init()