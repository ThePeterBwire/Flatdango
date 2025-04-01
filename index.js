const baseUrl = 'https://my-json-server.typicode.com/ThePeterBwire/Flatdango'; 
document.addEventListener('DOMContentLoaded', () => {
    fetchFilms();
    fetchFirstFilm();
    document.getElementById('buy-ticket').addEventListener('click', handleBuyTicket);
});

function fetchFilms() {
    fetch(`${baseUrl}/films`)
        .then(response => response.json())
        .then(films => {
            const filmsList = document.getElementById('films');
            filmsList.innerHTML = '';
            films.forEach(film => {
                const li = document.createElement('li');
                li.className = 'film item';
                if (film.capacity - film.tickets_sold === 0) {
                    li.classList.add('sold-out');
                }
                li.innerHTML = `
                    ${film.title}
                    <button class="delete-btn" data-id="${film.id}">Delete</button>
                `;
                filmsList.appendChild(li);
                li.addEventListener('click', () => displayFilmDetails(film));
            });
            addDeleteListeners();
        })
        .catch(error => console.error('Error fetching films:', error));
}

function fetchFirstFilm() {
    fetch(`${baseUrl}/films/1`)
        .then(response => response.json())
        .then(film => displayFilmDetails(film))
        .catch(error => console.error('Error fetching first film:', error));
}

function displayFilmDetails(film) {
    const availableTickets = film.capacity - film.tickets_sold;
    document.getElementById('poster').src = film.poster;
    document.getElementById('title').textContent = film.title;
    document.getElementById('runtime').textContent = `Runtime: ${film.runtime} minutes`;
    document.getElementById('showtime').textContent = `Showtime: ${film.showtime}`;
    document.getElementById('available-tickets').textContent = `Available Tickets: ${availableTickets}`;
    document.getElementById('description').textContent = film.description;
    const buyButton = document.getElementById('buy-ticket');
    buyButton.disabled = availableTickets === 0;
    buyButton.textContent = availableTickets === 0 ? 'Sold Out' : 'Buy Ticket';
    buyButton.dataset.filmId = film.id;
    buyButton.dataset.ticketsSold = film.tickets_sold;
    buyButton.dataset.capacity = film.capacity;
}

function handleBuyTicket(event) {
    const button = event.target;
    const filmId = button.dataset.filmId;
    const currentTicketsSold = parseInt(button.dataset.ticketsSold);
    const capacity = parseInt(button.dataset.capacity);

    if (capacity - currentTicketsSold <= 0) {
        return;
    }

    const newTicketsSold = currentTicketsSold + 1;

    fetch(`${baseUrl}/films/${filmId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tickets_sold: newTicketsSold })
    })
    .then(response => response.json())
    .then(updatedFilm => {
        button.dataset.ticketsSold = updatedFilm.tickets_sold;
        displayFilmDetails(updatedFilm);
        updateFilmInList(updatedFilm);
    })
    .catch(error => console.error('Error updating film:', error));

    fetch(`${baseUrl}/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            film_id: filmId,
            number_of_tickets: 1
        })
    })
    .catch(error => console.error('Error creating ticket:', error));
}

function updateFilmInList(film) {
    const deleteButton = document.querySelector(`.delete-btn[data-id="${film.id}"]`);
    if (!deleteButton) return;
    const filmItem = deleteButton.parentElement;
    const availableTickets = film.capacity - film.tickets_sold;
    filmItem.classList.toggle('sold-out', availableTickets === 0);
}

function addDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const filmId = button.dataset.id;
            deleteFilm(filmId);
        });
    });
}

function deleteFilm(filmId) {
    fetch(`${baseUrl}/films/${filmId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            const filmItem = document.querySelector(`.delete-btn[data-id="${filmId}"]`).parentElement;
            filmItem.remove();
        }
    })
    .catch(error => console.error('Error deleting film:', error));
}