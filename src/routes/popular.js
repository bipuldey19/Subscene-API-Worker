import { Hono } from "hono";
import cheerio from "cheerio";
import apiRequestRawHtml, {
  apiRequestJson,
} from "../helpers/apiRequestRawHtml";

const popular = new Hono();

const baseUrl = "https://subscene.com";

popular.get("/:cat?", async (c) => {
  try {
    let url = `${baseUrl}/browse/popular/all`;
    console.log(url);

    if (c.req.param("cat") === "movies") {
      url = `${baseUrl}/browse/popular/film/1`;
    }
    if (c.req.param("cat") === "series") {
      url = `${baseUrl}/browse/popular/series/1`;
    }
    if (c.req.param("cat") === "music") {
      url = `${baseUrl}/browse/popular/music/1`;
    }

    const body = await apiRequestRawHtml(url);
    const $ = cheerio.load(body);

    let results = {};

    $("table tr").each((i, tr) => {
      const td = $(tr).find("td.a1 a");
      const authorLink = $(tr).find("td.a5 a");

      if (td.length > 0) {
        let language =
          td
            .find("span.l.r.neutral-icon , .l.r.positive-icon, .l.r.bad-icon")
            .text()
            .trim() || null;
        let filmTitle = td.find(".new").text().trim() || null;
        let path = td.attr("href") || null;
        let type = $(tr).find("td.a3").text().trim() || null;
        let uploaded = $(tr).find("td.a6").text().trim() || null;
        let downloads = $(tr).find("td.a7").text().trim() || null;
        let author = authorLink.text().trim() || null;
        let authorProfile = baseUrl + authorLink.attr("href") || null;

        // console.log(language);

        if (language !== "") {
          if (!results[language]) {
            results[language] = [];
          }
          results[language].push({
            path,
            filmTitle,
            type,
            uploaded,
            downloads,
            author,
            authorProfile,
          });
        }
      }
    });

    cleanUpResults(results);

    return c.json(results);
  } catch (err) {
    console.log(err);
    c.status(500).json("Error while fetching data");
  }
});

export default popular;

function cleanUpResults(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/[\n\t]/g, "");
    } else if (typeof obj[key] === "object") {
      cleanUpResults(obj[key]);
    }
  }
}
