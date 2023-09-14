import { Hono } from "hono";
import cheerio from "cheerio";
import apiRequestRawHtml, {
  apiRequestJson,
} from "../helpers/apiRequestRawHtml";

const subtitles = new Hono();

const baseUrl = "https://subscene.com";

subtitles.get("/:path", async (c) => {
  const path = c.req.param("path");
  try {
    if (!path.length) {
      throw new Error("Path Is Empty");
    }
    const url = `${baseUrl}/subtitles/${path}`;
    const body = await apiRequestRawHtml(url);

    const $ = cheerio.load(body);

    let results = {};

    let title =
      $(".top.left .header h2")
        .contents()
        .filter(function () {
          return this.nodeType === 3;
        })
        .text()
        .trim() || null;

    let year =
      $(".top.left .header ul li:first-child")
        .text()
        .replace("Year:", "")
        .trim() || null;

    let poster = null;
    const posterDiv = $(".top.left .poster");
    const imgTag = posterDiv.find("img");
    if (imgTag.length > 0) {
      poster = imgTag.attr("src");
    }

    let imdb = $("a.imdb").attr("href") || null;
    const parts = imdb.split("/");
    const imdbId = parts[parts.length - 1];

    let imdbData = await apiRequestJson(
      `https://imdb.bymirrorx.eu.org/title/${imdbId}`
    );

    let imdbInfo = {
      imdb: imdb,
      description: imdbData.plot,
      poster: imdbData.image,
      type: imdbData.contentType,
      rating: imdbData.rating,
      contentRating: imdbData.contentRating,
      runtime: imdbData.runtime,
      released: imdbData.releaseDetailed,
      genres: imdbData.genre,
      top_credits: imdbData.top_credits,
      images: imdbData.images,
    };

    // if (imdb) {
    //   const imdbPage = await gotScraping(imdb);
    //   const imdbHtml = imdbPage.body;
    //   const imdb$ = cheerio.load(imdbHtml);

    //   const imdbDescription =
    //     imdb$("p[data-testid='plot'] span:first-child").text().trim() || null;
    //   const imdbRating =
    //     imdb$("div[data-testid='hero-rating-bar__aggregate-rating__score']")
    //       .first()
    //       .text()
    //       .split("/")[0]
    //       .trim() || null;
    //   const imdbRuntime =
    //     imdb$("div h1[data-testid='hero__pageTitle']")
    //       .closest("div")
    //       .find("ul li:last-child")
    //       .first()
    //       .text()
    //       .trim() || null;
    //   const imdbGenres = [];
    //   imdb$("div[data-testid='genres'] div:nth-child(2) a span").each(
    //     (i, span) => {
    //       imdbGenres.push(imdb$(span).text().trim());
    //     }
    //   );
    //   const imdbGenresString = imdbGenres.join(", ").toString();
    //   const imdbDirector =
    //     imdb$(
    //       "ul.ipc-metadata-list.ipc-metadata-list--dividers-all.title-pc-list.ipc-metadata-list--baseAlt li:nth-child(1) div ul li:first-child a"
    //     )
    //       .first()
    //       .text()
    //       .trim() || null;
    //   const imdbCasts = [];
    //   imdb$(
    //     "ul.ipc-metadata-list.ipc-metadata-list--dividers-all.title-pc-list.ipc-metadata-list--baseAlt li:last-child div ul li"
    //   ).each((i, li) => {
    //     imdbCasts.push(imdb$(li).text().trim());
    //   });
    //   const imdbCastsString = imdbCasts.join(", ").toString();

    //   imdbInfo = {
    //     description: imdbDescription,
    //     rating: imdbRating,
    //     runtime: imdbRuntime,
    //     genres: imdbGenresString,
    //     director: imdbDirector,
    //     casts: imdbCastsString,
    //   };
    // }

    info = {
      title,
      imdbInfo,
    };
    results["info"] = info;

    let subtitles = {};

    $("tr:not(:first-child)").each((i, tr) => {
      const td = $(tr).find("td.a1 a");
      const authorLink = $(tr).find("td.a5 a");
      const comment = $(tr).find("td.a6 div").text().trim() || null;

      if (td.length > 0) {
        let language =
          td
            .find("span.l.r.neutral-icon, .l.r.positive-icon, .l.r.bad-icon")
            .text()
            .trim() || null;
        let filmTitle =
          td
            .find(
              "span:not(.l.r.positive-icon), span:not(.l.r.neutral-icon), span:not(.l.r.bad-icon)"
            )
            .text()
            .replace(language, "")
            .trim() || null;
        let path = td.attr("href") || null;
        let author = authorLink.text().trim() || null;
        let authorProfile = baseUrl + authorLink.attr("href") || null;

        if (language !== "") {
          if (!subtitles[language]) {
            subtitles[language] = [];
          }
          subtitles[language].push({
            path,
            filmTitle,
            author,
            authorProfile,
            comment,
          });
        }
      }
    });

    results["subtitles"] = subtitles;
    cleanUpResults(results);

    return c.json(results);
  } catch (err) {
    console.log(err);
    c.status(500).json("Error while fetching data");
  }
});

subtitles.get("/:path/:lan/:id", async (c) => {
  try {
    if (
      !c.req.param("path").length ||
      !c.req.param("lan").length ||
      !c.req.param("id").length
    ) {
      throw new Error("Wrong Parameters");
    }
    const url = `${baseUrl}/subtitles/${c.req.param("path")}/${c.req.param(
      "lan"
    )}/${c.req.param("id")}`;
    console.log(url);
    const body = await apiRequestRawHtml(url);
    const $ = cheerio.load(body);

    let results = {};

    let title = $("span[itemprop='name']").text().trim() || null;
    let author = $(".author a").text().trim() || null;
    let type =
      $("#details ul li:nth-child(7)")
        .text()
        .replace("Release type:", "")
        .trim() || null;
    let files =
      $("#details ul li:nth-child(5)").text().replace("Files:", "").trim() ||
      null;
    let downloads =
      $("#details ul li:last-child").text().replace("Downloads:", "").trim() ||
      null;
    let uploadedAt =
      $("#details ul li:first-child").text().replace("Online:", "").trim() ||
      null;
      
      let releaseInfo = {};
      $("li.release div").each((i, div) => {
        releaseInfo[`${i + 1}`] = $(div).text().trim();
      });
      
    let download = baseUrl + $(".download a").attr("href") || null;

    // let download =
    //   "/download" +
    //     $(".download a").attr("href") +
    //     "/" +
    //     encodeURIComponent(releaseInfo[1]) || null;
    // if (!download) {
    //   throw "Unexpected Error";
    // }

    results["releaseInfo"] = releaseInfo;

    results = {
      title,
      author,
      type,
      files,
      downloads,
      uploadedAt,
      download,
      releaseInfo,
    };
    cleanUpResults(results);

    return c.json(results);
  } catch (err) {
    console.log(err);
    c.status(500).json("Error while fetching data");
  }
});

export default subtitles;

function cleanUpResults(obj) {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = obj[key].replace(/[\n\t]/g, "");
    } else if (typeof obj[key] === "object") {
      cleanUpResults(obj[key]);
    }
  }
}
