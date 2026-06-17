async function loadSeats() {

    const response = await fetch("/seats");
    const seats = await response.json();

    const table = document.getElementById("seatTable");

    table.innerHTML = "";

    seats.forEach(seat => {

        table.innerHTML += `
        <tr>
            <td>${seat.seat_number}</td>
            <td>${seat.status}</td>
            <td>
                <button onclick="resetSeat(${seat.id})">
                    Reset
                </button>
            </td>
        </tr>`;
    });
}

async function resetSeat(id) {

    await fetch(`/reset/${id}`, {
        method: "POST"
    });

    loadSeats();
}

loadSeats();