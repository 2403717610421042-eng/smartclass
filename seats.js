async function loadSeats() {

    const response =
        await fetch("/api/seats");

    const seats =
        await response.json();


    let available = 0;
    let booked = 0;


    const container =
        document.getElementById(
            "seatContainer"
        );

    container.innerHTML = "";


    seats.forEach(seat => {

        const button =
            document.createElement("button");

        button.className =
            "seat";


        button.innerText =
            seat.status === "Available"
            ? `💺 ${seat.seat_number}`
            : `🔒 ${seat.seat_number}`;


        if (seat.status === "Available") {

            button.classList.add(
                "available"
            );

            available++;

        } else {

            button.classList.add(
                "booked"
            );

            booked++;

        }


        container.appendChild(button);

    });


    document.getElementById(
        "total"
    ).innerText = seats.length;


    document.getElementById(
        "available"
    ).innerText = available;


    document.getElementById(
        "booked"
    ).innerText = booked;

}


loadSeats();

setInterval(
    loadSeats,
    10000
);
