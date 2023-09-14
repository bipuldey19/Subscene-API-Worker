import { Hono } from "hono";
import cheerio from "cheerio";
import apiRequestRawHtml from "../helpers/apiRequestRawHtml";

const search = new Hono();

const baseUrl = "https://subscene.com";

search.get("/", async (c) => {
  try {
    const query = c.req.query("q");
    console.log(query);
    if (!query.length) {
      throw new Error("Query Is Empty");
    }
    const url = `${baseUrl}/subtitles/searchbytitle?query=${query}`;
    const body = await apiRequestRawHtml(url); // Use apiRequestJson here
    const $ = cheerio.load(body);

    const results = {};

    $(".byTitle .search-result h2").each((i, h2) => {
      const ulName = $(h2).text().trim();
      const ul = $(h2).next("ul");

      results[ulName] = [];

      ul.find("li").each((j, li) => {
        const titleDiv = $(li).find(".title");
        const path = titleDiv.find("a").attr("href");
        const title = titleDiv.find("a").text().trim();
        const count = $(li).find(".subtle.count").text().trim();
        results[ulName].push({ path, title, count });
      });

      if (results[ulName].length === 0) {
        delete results[ulName];
      }
    });

    if (Object.keys(results).length === 0) {
      return c.json({
        message:
          "It looks like there aren't many great matches for your search",
      });
    }
    cleanUpResults(results);

    return c.json(results);
  } catch (err) {
    console.log(err);
    c.status(500);
    return c.json("Error while fetching data");
  }
});

export default search;

function cleanUpResults(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/[\n\t]/g, "");
    } else if (typeof obj[key] === "object") {
      cleanUpResults(obj[key]);
    }
  }
}
