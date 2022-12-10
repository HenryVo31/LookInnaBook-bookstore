// Send search queries to the server
function searchBooks() {
    let title = document.getElementsByName('title')[0].value;
    let author = document.getElementsByName('author')[0].value;
    let isbn = document.getElementsByName('isbn')[0].value;
    let genre = document.getElementsByName('genre')[0].value;
    // Validate search fields (at least one search field must be filled)
    if ((title == null || title == undefined || title == '') &&
        (author == null || author == undefined || author == '') &&
        (isbn == null || isbn == undefined || isbn == '') &&
        (genre == null || genre == undefined || genre == '')) {
        alert("Please fill in at least one search field!");
        return;
    }

    // Fetch the books by sending a URL with search params to the server
    var data = {"title": title, "author": author, "isbn": isbn, "genre": genre}
    let searchParams = new URLSearchParams(data)
    let url = 'http://localhost:3000/books?' + searchParams
    window.location.replace(url);
}

// Save the book's ISBN and Title in the user's local storage (acts as a cart)
function addCart(isbn, title, price) {
    let cart = []
    if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"))
    }
    let valid = true;
    if (cart.length > 0) {
        cart.forEach(book => {
            if (book[0] == isbn) {
                valid = false;
                return;
            }
        })
    }
    if (valid) {
        cart.push([isbn, title, price])
        localStorage.setItem("cart", JSON.stringify(cart))
        alert(`(${title}) has been added to Cart!`)
    }
    else {
        alert("Book already in cart!");
    }
}

// Render the user's cart onto the Cart page
function loadCart() {
    let cart = []
    if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        // Iterate through the cart, creating HTML elements for each item
        let totalPrice = 0
        cart.forEach(book => {
            // Create the element for the book's title
            let titleElement = document.createElement("a")
            titleElement.innerHTML = book[1]
            titleElement.setAttribute("href", `/book/${book[0]}`)
            // Create the element for the book's price
            let priceElement = document.createElement("span")
            priceElement.innerHTML = "- $" + book[2]
            totalPrice += book[2]
            // Create the remove button element
            let buttonElement = document.createElement("button")
            buttonElement.innerHTML = "Remove"
            buttonElement.setAttribute("onclick", `removeCart(${book[0]})`)
            // Create the div wrapper element around each item
            let divElement = document.createElement("div")
            divElement.appendChild(titleElement)
            divElement.appendChild(priceElement)
            divElement.appendChild(buttonElement)
            document.getElementById("cart").appendChild(divElement)
        })
        // Create the element for the total price
        let totalPriceElement = document.createElement("p")
        totalPriceElement.innerHTML = "Total: $" + totalPrice.toFixed(2);
        totalPriceElement.setAttribute("id", "total-price")
        document.getElementById("cart").appendChild(totalPriceElement)
        // Store the total price inside local storage
        localStorage.setItem("totalPrice", JSON.stringify(totalPrice.toFixed(2)));
    }
    else {
        alert("Cart is empty!")
    }
}

// Remove a book from the Cart
function removeCart(isbn) {
    let cart = {}
    if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        // Iterate through the cart, find the book and remove it
        let delIndex = -1
        cart.forEach(book => {
            if (book[0] == isbn) {
                delIndex = cart.indexOf(book)
            }
        })
        if (delIndex !== -1) {
            cart.splice(delIndex, 1);
        }
        localStorage.setItem("cart", JSON.stringify(cart))
        window.location.replace("http://localhost:3000/cart")
    }
    else {
        alert("Cart is already empty!")
    }
}

// Function to send order's info to the server
function submitOrder() {
    // Retrieve all ISBNs of books inside the cart
    let isbn = [];
    if (localStorage.getItem("cart")) {
        let cart = JSON.parse(localStorage.getItem("cart"));
        cart.forEach(book => {
            isbn.push(book[0]);
        })
    }
    else {
        alert("Cart is empty!")
        return;
    }
    if (isbn.length < 1) {
        alert("Cart is empty!")
        return;
    }

    // Get the other order's info and make sure they're not empty
    let shippingAddress = document.getElementsByName("shipping_address")[0].value;
    let creditCardNum = document.getElementsByName("credit_card_num")[0].value;
    let creditCardCVV = document.getElementsByName("credit_card_cvv")[0].value;
    let billingName = document.getElementsByName("billing_name")[0].value;
    let billingAddress = document.getElementsByName("billing_address")[0].value;
    if ((shippingAddress == null || shippingAddress == undefined || shippingAddress == '') ||
        (creditCardNum == null || creditCardNum == undefined || creditCardNum == '') ||
        (creditCardCVV == null || creditCardCVV == undefined || creditCardCVV == '') ||
        (billingName == null || billingName == undefined || billingName == '') ||
        (billingAddress == null || billingAddress == undefined || billingAddress == '')) {
            alert("Please fill in all of the fields!");
            return;
        }
    let totalPrice = JSON.parse(localStorage.getItem("totalPrice"));

    // Prepare data to be sent to the server
    let data = {"isbn": isbn, "shipping_address": shippingAddress, "credit_card_num": creditCardNum,
                "credit_card_cvv": creditCardCVV, "billing_name": billingName, "billing_address": billingAddress,
                "order_total_amount": totalPrice}

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Order Placed!");
            // Clear the cart
            localStorage.removeItem("cart");
            // Redirect to orders
            window.location.replace("http://localhost:3000/orders");
        }
    }
    xhttp.open("POST", "/orders");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data))
}

// Function to send the order to the server to mark it as complete, and record it as a sales
function completeOrder(order_num) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Order Completed!");
            // Refresh the page
            location.reload();
        }
    }
    xhttp.open("PUT", "/orders");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({"order_num": order_num}))
}

// Function to send a book's ISBN to the server for deletion
function removeBook(isbn) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert("Book Removed!");
            // Refresh the page
            location.reload();
        }
    }
    xhttp.open("DELETE", "/books");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify({"isbn": isbn}))
}
