document.addEventListener("DOMContentLoaded", () => {
    // Grab all the elements from the DOM
    const filmsList = document.getElementById("films");
    const poster = document.getElementById("poster");
    const title = document.getElementById("title");
    const runtime = document.getElementById("runtime-value");
    const showtime = document.getElementById("showtime-value");
    const tickets = document.getElementById("tickets-value");
    const description = document.getElementById("description-value");
    const buyTicketButton = document.getElementById("buy-ticket");
  
    let currentMovie; 
  
    // Fetch all movies kutoka server. Piga request kwa server
    fetch("http://localhost:3000/films")
      .then((response) => response.json())
      .then((movies) => {
        // Ondoa placeholder <li> if present
        const placeholder = document.querySelector("#films .film.item");
        if (placeholder) {
          placeholder.remove();
        }
  
        // Show details ya movie ya kwanza
        displayMovieDetails(movies[0]);
  
        // Display list ya movies 
        displayMovies(movies);
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
        alert("Failed to load movies. Please try again later"); // Kama kuna shida, onyesha hii error
      });
  
    // Function ya kuonyesha details ya movie 
    function displayMovieDetails(movie) {
      currentMovie = movie; 
      poster.src = movie.poster; 
      title.textContent = movie.title; 
      runtime.textContent = movie.runtime; 
      showtime.textContent = movie.showtime; 
      const availableTickets = movie.capacity - movie.tickets_sold; 
      tickets.textContent = availableTickets; 
      description.textContent = movie.description; 
  
      // Kama tiketi zimeisha onyesha "Sold Out"
      if (availableTickets === 0) {
        buyTicketButton.textContent = "Sold Out"; 
        buyTicketButton.disabled = true; 
      } else {
        buyTicketButton.textContent = "Buy Ticket"; 
        buyTicketButton.disabled = false; //activates buy ticket button
      }
    }
  
    // Function ya kuonyesha list ya movies 
    function displayMovies(movies) {
      movies.forEach((movie) => {
        const li = document.createElement("li"); 
        li.textContent = movie.title; 
        li.classList.add("film", "item"); 
  
        // Kama tikets zimeisha inaongeza class ya "sold-out"
        if (movie.tickets_sold >= movie.capacity) {
          li.classList.add("sold-out");
        }
  
        // Add delete button for kila movie
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete"; 
        deleteButton.addEventListener("click", (e) => {
          e.stopPropagation(); 
          deleteMovie(movie.id, li); 
        });
        li.appendChild(deleteButton);
  
        // Add click event for kila movie
        li.addEventListener("click", () => {
          fetch(`http://localhost:3000/films/${movie.id}`)
            .then((response) => response.json())
            .then((movieDetails) => displayMovieDetails(movieDetails))
            .catch((error) => console.error("Error fetching movie details:", error));
        });
  
        filmsList.appendChild(li); 
      });
    }
  
    // Function ya kufuta movie
    function deleteMovie(movieId, li) {
      fetch(`http://localhost:3000/films/${movieId}`, {
        method: "DELETE", // Piga DELETE request kwa server
      })
        .then(() => {
          li.remove(); 
        })
        .catch((error) => console.error("Error deleting movie:", error)); // Kama kuna shida, show error
    }
  
    // Buy Ticket functionality (Nunua tiketi kwa movie)
    buyTicketButton.addEventListener("click", () => {
      if (currentMovie.tickets_sold < currentMovie.capacity) { // Kama kuna tikets zimebaki
        currentMovie.tickets_sold++; 
        const availableTickets = currentMovie.capacity - currentMovie.tickets_sold; // Hesabu tikets zimebaki
        tickets.textContent = availableTickets; // Updates number of tickets on the UI
  
        // Piga PATCH request kwa server
        fetch(`http://localhost:3000/films/${currentMovie.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tickets_sold: currentMovie.tickets_sold, // updates tickets bought
          }),
        })
          .then((response) => response.json())
          .then((updatedMovie) => {
            console.log("Updated movie:", updatedMovie); 
          })
          .catch((error) => console.error("Error updating movie:", error)); 
  
        // POST new ticket (Piga POST request kwa server)
        fetch("http://localhost:3000/tickets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            film_id: currentMovie.id, // Weka ID ya movie
            number_of_tickets: 1, 
          }),
        })
          .then((response) => response.json())
          .then((newTicket) => {
            console.log("New ticket:", newTicket); // Log tikets mpya
          })
          .catch((error) => console.error("Error creating ticket:", error)); 
        // Update UI kama tikets zimeisha 
        if (availableTickets === 0) {
          buyTicketButton.textContent = "Sold Out"; // Tikets zimeisha
          buyTicketButton.disabled = true; // Disables buy ticket button
          const filmItem = Array.from(filmsList.children).find(
            (li) => li.textContent === currentMovie.title
          );
          filmItem.classList.add("sold-out"); // Add class ya "sold-out" kwa movie
        }
      }
    });
  });