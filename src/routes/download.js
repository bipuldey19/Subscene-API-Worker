import { Hono } from "hono";
import apiDownload from "../helpers/apiRequestRawHtml";

const download = new Hono();

const baseUrl = "https://subscene.com";
const brandName = "MirrorX";

download.get("/subtitles/:lan/:id/:name", async (c) => {
  try {
    const lan = c.req.param("lan");
    const id = c.req.param("id");
    const name = c.req.param("name");

    const downloadUrl = `${baseUrl}/subtitles/${lan}/${id}`;

    return c.body("Hello there!!!")
  } catch (err) {
    console.error(err);
    c.status(500).json("Error while fetching data");
  }
});

export default download;
