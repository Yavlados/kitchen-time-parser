const ftp = require("ftp");
const fs = require("fs");

const c = new ftp();

c.on("ready", function () {
  c.list(".", (err, listing) => {
    c.get("/zwilling.xml", (err, stream) => {
      var content = "";
      stream.on("data", function (chunk) {
        content += chunk.toString();
      });
      stream.on("end", function () {
        console.log(content);
      });
    });
    console.log(listing);
  });
});

c.connect({ host: "ftp2.pmkc.ru", user: "zwilling", password: "cp2895va" });

