import { Hono } from "hono";

const baseUrl = "https://subscene.com";
const search = new Hono();

search.get("/search", async (c) => {
  const query = c.req.query("q");
  try {
    if (!query) {
      throw new Error("Query Is Empty");
    }
    const url = `${baseUrl}/subtitles/searchbytitle?query=${query}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Error while fetching data");
    }

    const text = await response.text();
    const results = parseHTML(text);

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

function parseHTML(html) {
  const results = {};

  const regex = /<h2 class="[^"]+">([^<]+)<\/h2>[\s\S]*?<ul>([\s\S]*?)<\/ul>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const ulName = match[1].trim();
    const ul = match[2];

    results[ulName] = [];

    const liRegex = /<li>([\s\S]*?)<\/li>/g;
    let liMatch;
    while ((liMatch = liRegex.exec(ul)) !== null) {
      const liText = liMatch[1];
      const pathMatch = /<a href="([^"]+)">/.exec(liText);
      const titleMatch = /<a[^>]+>([^<]+)<\/a>/.exec(liText);
      const countMatch = /<span class="subtle count">([^<]+)<\/span>/.exec(liText);

      if (pathMatch && titleMatch && countMatch) {
        const path = pathMatch[1];
        const title = titleMatch[1].trim();
        const count = countMatch[1].trim();
        results[ulName].push({ path, title, count });
      }
    }

    if (results[ulName].length === 0) {
      delete results[ulName];
    }
  }

  return results;
}

function cleanUpResults(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/[\n\t]/g, "");
    } else if (typeof obj[key] === "object") {
      cleanUpResults(obj[key]);
    }
  }
}