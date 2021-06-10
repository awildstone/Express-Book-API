/** Server for bookstore. */

const { PORT } = require("./config");
const app = require("./app");

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
