import { Hono } from "hono";
import unzip from "adm-zip";
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

    const file = await apiDownload(downloadUrl);

    if (!file || file.length === 0) {
      throw new Error("File Downloading Error");
    }

    let zip = new unzip(file);
    let zipData = [];
    zip.getEntries().map((e, i) => {
      if (e.name && e.getData && e.getData())
        zipData.push({
          filename: e.name,
          file: e.getData(),
        });
    });

    return c.body(zipData);
  } catch (err) {
    console.error(err);
    c.status(500).json("Error while fetching data");
  }
});

export default download;
