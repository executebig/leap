async function routes(fastify, options){
    fastify.get('/', async function(request, reply) {
         reply.view("pages/home", { title: "Test" })
    }), 

    fastify.get('/bye', async function(request, reply) {
         return {bye: 'good bye'} 
    }) 
}

module.exports = routes
module.exports.autoPrefix = '/'