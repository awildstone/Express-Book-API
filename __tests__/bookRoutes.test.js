process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

describe("Book Route Tests", () => {

    let book1;
    let book2;

    beforeEach(async () => {
        //remove all book data from DB
        await db.query("DELETE FROM books");

        //create new books
        book1 = await Book.create({
            isbn: "9780743277709",
            amazon_url: "https://www.amazon.com/Watership-Down-Novel-Richard-Adams/dp/0743277708/",
            author: "Richard Adams",
            language: "English",
            pages: 476,
            publisher: "Puffin Books",
            title: "Watership Down",
            year: 2005
        });

        book2 = await Book.create({
            isbn: "0064405028",
            amazon_url: "https://www.amazon.com/Voyage-Dawn-Treader-Chronicles-Narnia/dp/0064405028/",
            author: "C. S. Lewis",
            language: "English",
            pages: 256,
            publisher: "HarperCollins",
            title: "The Voyage of the Dawn Treader",
            year: 1994
        });
    });

    describe("GET / ", () => {

        test("Returns all books.", async () => {
            let res = await request(app).get("/books/");

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ books: [
                { 
                    isbn: book2.isbn,
                    amazon_url: book2.amazon_url,
                    author: book2.author,
                    language: book2.language,
                    pages: book2.pages,
                    publisher: book2.publisher,
                    title: book2.title,
                    year: book2.year},
                { 
                    isbn: book1.isbn,
                    amazon_url: book1.amazon_url,
                    author: book1.author,
                    language: book1.language,
                    pages: book1.pages,
                    publisher: book1.publisher,
                    title: book1.title,
                    year: book1.year}
                ]
            });
        });
    });

    describe("GET /:id ", () => {

        test("Return book with matching isbn id.", async () => {
            let res = await request(app).get(`/books/${book2.isbn}`)

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ book: { 
                isbn: book2.isbn,
                amazon_url: book2.amazon_url,
                author: book2.author,
                language: book2.language,
                pages: book2.pages,
                publisher: book2.publisher,
                title: book2.title,
                year: book2.year }
            });
        });

        test("Return 404 for isbn that does\'t exist.", async () => {
            let res = await request(app).get("/books/0");

            expect(res.statusCode).toEqual(404);
        });
    });

    describe("POST / ", () => {

        test("Creates a new Book.", async () => {
            let newBook = {
                isbn: "979-8749522310",
                amazon_url: "https://www.amazon.com/Alice-Wonderland-Original-Complete-Illustrations/dp/B0948LPG76/",
                author: "Lewis Carroll",
                language: "English",
                pages: 101,
                publisher: "Independently published (May 6, 2021)",
                title: "Alice in Wonderland",
                year: 1865 
            }

            let res = await request(app).post("/books/").send(newBook);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual({ book: {
                isbn: newBook.isbn,
                amazon_url: newBook.amazon_url,
                author: newBook.author,
                language: newBook.language,
                pages: newBook.pages,
                publisher: newBook.publisher,
                title: newBook.title,
                year: newBook.year
            }});
        });

        test("Returns 400 for book with unexpected data.", async () => {
            let badBook = {
                isbn: "979-8749522310",
                amazon_url: "https://www.amazon.com/Alice-Wonderland-Original-Complete-Illustrations/dp/B0948LPG76/",
                author: "Lewis Carroll",
                language: "English",
                pages: 101,
                secret: "I'm gonna mess things up! Maybe",
                publisher: "Independently published (May 6, 2021)",
                title: "Alice in Wonderland",
                year: 1865 
            }

            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
        });

        test("Return 400 for empty data.", async () => {
            let badBook = {};
            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
        });

        test("Return 400 for some missing data.", async () => {
            let badBook = {
                isbn: "979-8749522310",
                author: "Lewis Carroll",
                title: "Alice in Wonderland",
                year: 1865 
            }
            
            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance requires property \"language\"", "instance requires property \"pages\""]);
        });

        test("Return 400 for invalid isbn type String.", async () => {
            let badBook = {
                isbn: 979-8749522310,
                amazon_url: "https://www.amazon.com/Alice-Wonderland-Original-Complete-Illustrations/dp/B0948LPG76/",
                author: "Lewis Carroll",
                language: "English",
                pages: 101,
                publisher: "Independently published (May 6, 2021)",
                title: "Alice in Wonderland",
                year: 1865 
            }
            
            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance.isbn is not of a type(s) string"]);
        });

        test("Return 400 for invalid pages type Integer.", async () => {
            let badBook = {
                isbn: "979-8749522310",
                amazon_url: "https://www.amazon.com/Alice-Wonderland-Original-Complete-Illustrations/dp/B0948LPG76/",
                author: "Lewis Carroll",
                language: "English",
                pages: "101",
                publisher: "Independently published (May 6, 2021)",
                title: "Alice in Wonderland",
                year: 1865 
            }

            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance.pages is not of a type(s) integer"]);
        });

        test("Return 400 for invalid year type Integer.", async () => {
            let badBook = {
                isbn: "979-8749522310",
                amazon_url: "https://www.amazon.com/Alice-Wonderland-Original-Complete-Illustrations/dp/B0948LPG76/",
                author: "Lewis Carroll",
                language: "English",
                pages: 101,
                publisher: "Independently published (May 6, 2021)",
                title: "Alice in Wonderland",
                year: "1865" 
            }

            let res = await request(app).post("/books/").send(badBook);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance.year is not of a type(s) integer"]);
        });
    });

    describe("PUT /:isbn ", () => {

        test("Updates book via book isbn.", async () => {
            let updatedYearandPulisher = {
                amazon_url: "https://www.amazon.com/Voyage-Dawn-Treader-Chronicles-Narnia/dp/0064405028/",
                author: "C. S. Lewis",
                language: "English",
                pages: 256,
                publisher: "Independently published (May 6, 2021)",
                title: "The Voyage of the Dawn Treader",
                year: 2021
            }

            let res = await request(app).put(`/books/${book2.isbn}`).send(updatedYearandPulisher);
            expect(res.statusCode).toEqual(200);
            expect(res.body.book.publisher).toEqual("Independently published (May 6, 2021)");
            expect(res.body.book.year).toEqual(2021);
        });

        test("Returns 404 if book isbn is not found.", async () => {
            let updatedYearandPulisher = {
                amazon_url: "https://www.amazon.com/Voyage-Dawn-Treader-Chronicles-Narnia/dp/0064405028/",
                author: "C. S. Lewis",
                language: "English",
                pages: 256,
                publisher: "Independently published (May 6, 2021)",
                title: "The Voyage of the Dawn Treader",
                year: 2021
            }

            let res = await request(app).put(`/books/0`).send(updatedYearandPulisher);
            expect(res.statusCode).toEqual(404);
        });

        test("Returns 400 if data is empty.", async () => {
            let blankBook = {};
            let res = await request(app).put(`/books/${book1.isbn}`).send(blankBook);
            expect(res.statusCode).toEqual(400);
        });

        test("Returns 400 if some require data is missing.", async () => {
            let missingData = {
                author: "C. S. Lewis - LOL",
                title: "The Voyage of the Dawn Treader - MY FAVORITE!",
            }
            let res = await request(app).put(`/books/${book2.isbn}`).send(missingData);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual([ 
                "instance requires property \"language\"",
                "instance requires property \"pages\"",
                "instance requires property \"year\""]);
        });

        test("Returns 400 if isbn is present in request.", async () => {
            let hasisbn = {
                isbn: "979-8749522310",
                amazon_url: "https://www.amazon.com/Voyage-Dawn-Treader-Chronicles-Narnia/dp/0064405028/",
                author: "C. S. Lewis",
                language: "English",
                pages: 256,
                publisher: "HarperCollins",
                title: "The Voyage of the Dawn Treader",
                year: 1994
            }

            let res = await request(app).put(`/books/${book2.isbn}`).send(hasisbn);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual("Updating isbn property not allowed.");
        });

        test("Returns 400 if pages is not type Integer.", async () => {
            let wrongPages = {
                amazon_url: "https://www.amazon.com/Watership-Down-Novel-Richard-Adams/dp/0743277708/",
                author: "Richard Adams",
                language: "English",
                pages: "476",
                publisher: "Puffin Books",
                title: "Watership Down",
                year: 2005
            }

            let res = await request(app).put(`/books/${book1.isbn}`).send(wrongPages);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance.pages is not of a type(s) integer"]);
        });

        test("Returns 400 if year is not type Integer.", async () => {
            let wrongYear = {
                amazon_url: "https://www.amazon.com/Watership-Down-Novel-Richard-Adams/dp/0743277708/",
                author: "Richard Adams",
                language: "English",
                pages: 476,
                publisher: "Puffin Books",
                title: "Watership Down",
                year: "2005"
            }

            let res = await request(app).put(`/books/${book1.isbn}`).send(wrongYear);
            expect(res.statusCode).toEqual(400);
            expect(res.body.message).toEqual(["instance.year is not of a type(s) integer"]);
        });
    });

    describe("DELETE /:isbn", () => {

        test("Deletes a book via book isbn.", async () => {
            let res = await request(app).delete(`/books/${book2.isbn}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ message: "Book deleted" });

            let bookCount = await Book.findAll()
            expect(bookCount.length).toEqual(1);
        });

        test("Returns 404 for a book isbn that does not exsit.", async () => {
            let res = await request(app).delete("/books/0");
            expect(res.statusCode).toEqual(404);
        });
    });
});

afterAll(async () => {
    //close DB connection
    await db.end();
  });