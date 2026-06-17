async function loadSeats() {

    const response = await fetch("/seats");
    const seats = await response.json();

    const container = document.getElementById("seatContainer");

    container.innerHTML = "";

    seats.forEach(seat => {

        const btn = document.createElement("button");

        btn.innerText = seat.seat_number;

        btn.classList.add("seat");

        if(seat.status === "Available"){

            btn.classList.add("available");

            btn.onclick = async () => {

                await fetch(`/book/${seat.id}`, {
                    method: "POST"
                });

                loadSeats();
            };

        }
        else{
            btn.classList.add("booked");
            btn.disabled = true;
        }

        container.appendChild(btn);
    });
}

loadSeats();