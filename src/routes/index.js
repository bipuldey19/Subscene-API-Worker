import { Hono } from "hono";

const index = new Hono();

index.get("/", async (c) => {
  try {
    const homeData = {
      search: "/search?q=[YOUR_QUERY_HERE]",
      getSub: "/subtitles/[PATH]",
      dlSub: "/subtitles/[PATH]/[LANGUAGE]/[ID]/[NAME]",
      popular: "/popular",
      latest: "/latest",
    };

    // Clean up the results to remove \n and \t
    cleanUpResults(homeData);

    return c.json(homeData);
  } catch (err) {
    console.log(err);
    c.status(500).json("Error while fetching data");
  }
});

export default index;

function cleanUpResults(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/[\n\t]/g, "");
    } else if (typeof obj[key] === "object") {
      cleanUpResults(obj[key]);
    }
  }
}

