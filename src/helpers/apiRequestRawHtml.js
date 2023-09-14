export default async function apiRequestRawHtml(url) {
    let data = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        accept: "text/html",
        "accept-language": "en-US",
      },
    });
    let text = await data.text();
    return text;
  }
  
  export async function apiRequestJson(url) {
    let data = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
        accept: "text/html",
        "accept-language": "en-US",
      },
    });
    let text = await data.json();
    return text;
  }

  export async function apiDownload(url) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
          accept: "text/html",
          "accept-language": "en-US",
        },
      });
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
  
      const buffer = await response.arrayBuffer();
      return buffer;
    } catch (error) {
      console.error("Error in apiDownload:", error);
      throw error; // Rethrow the error to be handled elsewhere if needed
    }
  }
  