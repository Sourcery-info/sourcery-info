import { WebSocketServer } from "ws";
import http from "http";

export const wssWebserver = http.createServer();
export const wss = new WebSocketServer({ server: wssWebserver });

const cmds: any = {
    aschat: async (data: any) => {
        console.log("chat", data);
        return { response: "I'm a teapot" };
    },
    echo: async (data: string) => {
        console.log("echo", data);
        return { response: `echo ${data}` };
    }
}
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);

    ws.on("message", async function message(data: string) {
        try {
            const json = JSON.parse(data);
            console.log(json);
            if (!json.cmd) {
                throw new Error("missing cmd");
            }
            if (typeof json.cmd !== "string") {
                throw new Error("cmd must be a string");
            }
            const cmd = cmds[json.cmd];
            if (!cmd) {
                throw new Error("unknown cmd");
            }
            const response = await cmd(json.data);
            console.log("received: %s", data);
            console.log("sending: %s", JSON.stringify(response));
            ws.send(JSON.stringify(response));
        } catch (e: any) {
            console.error(e);
            ws.send(`error: ${e.message}`);
        }
    });

    ws.send("hello");
});
