import { connect } from "./client.ts";
import "./server";

await connect();
// await wait_for_connection();
console.log("Websocket server ready");
