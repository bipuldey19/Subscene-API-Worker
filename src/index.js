import { Hono } from "hono";
import { cors } from "hono/cors";
import index from "./routes/index";
import search from "./routes/search";
import subtitles from "./routes/subtitles";
import download from "./routes/download";
import popular from "./routes/popular";
import latest from "./routes/latest";

const app = new Hono();

app.route("/", index);
app.route("/search", search);
app.route("/subtitles", subtitles);
app.route("/download", download);
app.route("/popular", popular);
app.route("/latest", latest);

app.fire();
