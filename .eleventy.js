const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  // Copia gli asset statici (CSS, immagini) così come sono
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });

  //Sveltia News, Progetti e Board
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.ignores.add("src/admin/**");

  // Anno corrente, comodo per il footer
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // Data in italiano: 1 giugno 2026
  eleventyConfig.addFilter("dataIt", (d) => {
    const data = new Date(d);
    const mesi = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
    return `${data.getUTCDate()} ${mesi[data.getUTCMonth()]} ${data.getUTCFullYear()}`;
  });

  // Ottimizzazione automatica di tutte le <img> in build
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "auto"],
    widths: [400, 800, 1200, "auto"],
    outputDir: "./_site/assets/img/optimized/",
    urlPath: "/assets/img/optimized/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 768px) 50vw, 100vw"
    }
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
