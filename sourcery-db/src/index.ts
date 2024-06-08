import restify from "restify";
import { LanceDB, Field, Utf8, Int32 } from "./lancedb.ts";
import dotenv from "dotenv";
dotenv.config();

const server = restify.createServer()
server.use(restify.plugins.bodyParser())

server.use(async (req, res) => {
    if (!req.params.project_name) return;
    const projectName = req.params.project_name.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").slice(0, 50)
    req.params.project_name = projectName;
    req.params.dir = `${process.env.PROJECT_DIR}/${projectName}/data`
})

server.get('/', (req, res) => {
    res.send('Documentation coming...')
})

server.get("/setup/:project_name", async (req, res) => {
    const uri = req.params.dir
    const db = new LanceDB()
    const response = await db.connect({ uri })
    const table_exists = await db.tableExists("index")
    if (!table_exists) {
        const schema = [
            new Field("id", new Int32()),
            new Field("filename", new Utf8()),
            new Field("filetype", new Utf8()),
            
        ]
        await db.createTable("index", schema)
    }
    res.send(response)
})

server.post("/index/:project_name", async (req, res) => {
    const projectName = req.params.project_name
    const model = req.body.model
    const db = new LanceDB()
    
    res.send(response)
});