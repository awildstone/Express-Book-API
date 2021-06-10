const jsonschema = require("jsonschema");
const bookSchema = require("./schemas/book.json");
const updateBookSchema = require("./schemas/updateBook.json");
const ExpressError = require("./expressError");

/** 
 * Validates request Book data against JSON Book Schema.
 *  data => True || throws Error
 */

function validateBook(reqType, data) {
  let result;
  reqType === "post" ? result = jsonschema.validate(data, bookSchema) :
  result = jsonschema.validate(data, updateBookSchema);
  if (!result.valid) {
    let errorsList = result.errors.map(error => error.stack);
    throw new ExpressError(errorsList, 400);
  }
  return result.valid
}

module.exports = validateBook;