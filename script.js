class Book {

    #title;
    #author;
    #pages;

    constructor(title, author, pages) {

        this.#title = title;
        this.#author = author;
        this.#pages = pages;

    }

    get title() {
        return this.#title;
    }

    get author() {
        return this.#author;
    }

    get pages() {
        return this.#pages;
    }

    getSummary() {
        return `${this.#title} by ${this.#author}, ${this.#pages} pages`;
    }

}

class FictionBook extends Book {

    #genre;

    constructor(title, author, pages, genre) {

        super(title, author, pages);
        this.#genre = genre;

    }

    getSummary() {
        return `${super.getSummary()}, ${this.#genre} fiction`;
    }

}

class NonFictionBook extends Book {

    #topic;

    constructor(title, author, pages, topic) {

        super(title, author, pages);
        this.#topic = topic;

    }

    getSummary() {
        return `${super.getSummary()}, ${this.#topic} nonfiction`;
    }

}

class Bookshelf {

    #books = [];

    addBook(book) {
        this.#books.push(book);
    }

    getBooksByAuthor(author) {
        return this.#books.filter(book => book.author.toLowerCase() === author.trim().toLowerCase());
    }

    getLongestBook() {
        return this.#books.reduce((longest, book) =>
            longest === null || book.pages > longest.pages ? book : longest, null);
    }

    getAveragePages() {

        if (this.#books.length === 0) return 0;

        const totalPages = this.#books.reduce((total, book) => total + book.pages, 0);

        return totalPages / this.#books.length;

    }

    getBookSummaries() {
        return this.#books.map(book => book.getSummary());
    }

}

// User interface
const bookshelf = new Bookshelf();
const bookDetails = [];
const form = document.querySelector("#bookForm");
const bookType = document.querySelector("#bookType");
const category = document.querySelector("#category");
const authorSearch = document.querySelector("#authorSearch");

const categories = {
    fiction: ["Science", "Fantasy", "Mystery", "Historical", "Horror", "Literary"],
    nonfiction: ["History", "Science", "Biography", "Technology", "Music", "Self-help"]
};

function updateCategories() {

    document.querySelector("#categoryLabel").textContent =
        bookType.value === "fiction" ? "Genre" : "Topic";

    category.replaceChildren(...categories[bookType.value].map(name => {

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        return option;

    }));

}

function createCover(book) {

    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 450;
    const context = canvas.getContext("2d");

    context.fillStyle = book instanceof FictionBook ? "#294e59" : "#644b36";
    context.fillRect(0, 0, 300, 450);
    context.strokeStyle = "#e1b77b";
    context.lineWidth = 3;
    context.strokeRect(18, 18, 264, 414);
    context.fillStyle = "#f4eadb";
    context.textAlign = "center";
    context.font = "bold 28px Georgia";
    context.fillText(book.title, 150, 180, 245);
    context.font = "18px Georgia";
    context.fillText(book.author, 150, 225, 245);
    context.font = "14px sans-serif";
    context.fillText(book instanceof FictionBook ? "FICTION" : "NONFICTION", 150, 390);

    return canvas.toDataURL("image/png");

}

function renderBooks() {

    const summaries = bookshelf.getBookSummaries();
    const search = authorSearch.value.trim();
    const matches = search ? bookshelf.getBooksByAuthor(search) : null;
    const longest = bookshelf.getLongestBook();

    document.querySelector("#bookCount").textContent = summaries.length;
    document.querySelector("#averagePages").textContent =
        Number(bookshelf.getAveragePages().toFixed(1));
    document.querySelector("#longestBook").textContent =
        longest ? `${longest.title} (${longest.pages})` : "—";

    const cards = bookDetails.map(({ book, cover }, index) => {

        if (matches && !matches.includes(book)) return null;

        const card = document.createElement("article");
        card.className = "bookCard";

        const image = document.createElement("img");
        image.alt = `Cover of ${book.title}`;
        const fallback = createCover(book);
        image.src = cover || fallback;
        image.addEventListener("error", () => { image.src = fallback; }, { once: true });

        const info = document.createElement("div");
        info.className = "bookInfo";
        const heading = document.createElement("h3");
        heading.textContent = book.title;
        const summary = document.createElement("p");
        summary.textContent = summaries[index];

        info.append(heading, summary);
        card.append(image, info);
        return card;

    }).filter(Boolean);

    document.querySelector("#bookList").replaceChildren(...cards);
    const emptyMessage = document.querySelector("#emptyMessage");
    emptyMessage.hidden = cards.length > 0;
    emptyMessage.textContent = summaries.length ? "No books match that author." :
        "Your shelf is empty. Add a book to get started!";

}

form.addEventListener("submit", event => {

    event.preventDefault();

    const title = document.querySelector("#title").value.trim();
    const author = document.querySelector("#author").value.trim();
    const pages = Number(document.querySelector("#pages").value);
    const cover = document.querySelector("#cover").value.trim();

    if (!title || !author || !Number.isInteger(pages) || pages < 1) {
        alert("Please enter a title, author, and positive whole number of pages.");
        return;
    }

    const book = bookType.value === "fiction"
        ? new FictionBook(title, author, pages, category.value)
        : new NonFictionBook(title, author, pages, category.value);

    bookshelf.addBook(book);
    bookDetails.push({ book, cover });

    form.reset();
    authorSearch.value = "";
    updateCategories();
    renderBooks();

});

bookType.addEventListener("change", updateCategories);
authorSearch.addEventListener("input", renderBooks);

updateCategories();
renderBooks();
