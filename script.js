let allSeats = [];

let selectedSeatId = null;


// ==========================================
// LOAD SEATS
// ==========================================

async function loadSeats() {

    try {

        const response = await fetch("/seats");

        if (!response.ok) {
            throw new Error("Failed to load seats");
        }

        allSeats = await response.json();

        displaySeats(allSeats);

        loadStatistics();

    } catch (error) {

        console.error(error);

        showToast("Unable to load seats");

    }
}


// ==========================================
// DISPLAY SEATS
// ==========================================

function displaySeats(seats) {

    const container =
        document.getElementById("seatContainer");

    container.innerHTML = "";


    seats.forEach(seat => {

        const button =
            document.createElement("button");


        button.className = "seat";


        button.innerText =
            seat.seat_number;


        if (seat.status === "Available") {

            button.classList.add("available");

            button.onclick = () => {

                selectSeat(
                    seat.id,
                    seat.seat_number
                );

            };

        } else {

            button.classList.add("booked");

            button.disabled = true;

        }


        container.appendChild(button);

    });
}


// ==========================================
// SELECT SEAT
// ==========================================

function selectSeat(id, seatNumber) {

    selectedSeatId = id;


    document.getElementById(
        "selectedSeat"
    ).innerText = seatNumber;


    document.getElementById(
        "bookingPanel"
    ).classList.remove("hidden");


    window.scrollTo({
        top:
            document.getElementById(
                "bookingPanel"
            ).offsetTop,

        behavior: "smooth"
    });


    document
        .querySelectorAll(".seat")
        .forEach(button => {

            button.classList.remove("selected");

        });


    const buttons =
        document.querySelectorAll(".seat");


    buttons.forEach(button => {

        if (button.innerText === seatNumber) {

            button.classList.add("selected");

        }

    });

}


// ==========================================
// CONFIRM BOOKING
// ==========================================

async function confirmBooking() {

    const name =
        document.getElementById(
            "studentName"
        ).value.trim();


    const email =
        document.getElementById(
            "studentEmail"
        ).value.trim();


    if (!selectedSeatId) {

        showToast(
            "Please select a seat"
        );

        return;
    }


    if (!name || !email) {

        showToast(
            "Please enter your name and email"
        );

        return;
    }


    if (!email.includes("@")) {

        showToast(
            "Please enter a valid email"
        );

        return;
    }


    try {

        const response = await fetch(
            `/book/${selectedSeatId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    student_name: name,

                    student_email: email

                })
            }
        );


        const result =
            await response.json();


        if (!response.ok) {

            showToast(
                result.message ||
                "Booking failed"
            );

            return;
        }


        showToast(
            "🎉 Seat booked successfully!"
        );


        document.getElementById(
            "studentName"
        ).value = "";


        document.getElementById(
            "studentEmail"
        ).value = "";


        cancelSelection();


        loadSeats();

    } catch (error) {

        console.error(error);

        showToast(
            "Server error"
        );

    }
}


// ==========================================
// CANCEL SELECTION
// ==========================================

function cancelSelection() {

    selectedSeatId = null;


    document.getElementById(
        "bookingPanel"
    ).classList.add("hidden");


    document.getElementById(
        "selectedSeat"
    ).innerText = "-";


    document
        .querySelectorAll(".seat")
        .forEach(button => {

            button.classList.remove(
                "selected"
            );

        });

}


// ==========================================
// STATISTICS
// ==========================================

async function loadStatistics() {

    try {

        const response =
            await fetch("/stats");


        const stats =
            await response.json();


        document.getElementById(
            "totalSeats"
        ).innerText = stats.total;


        document.getElementById(
            "availableSeats"
        ).innerText = stats.available;


        document.getElementById(
            "bookedSeats"
        ).innerText = stats.booked;

    } catch (error) {

        console.error(error);

    }
}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchSeat")
    .addEventListener(
        "input",
        filterSeats
    );


// ==========================================
// FILTER
// ==========================================

document
    .getElementById("filterSeat")
    .addEventListener(
        "change",
        filterSeats
    );


function filterSeats() {

    const search =
        document
            .getElementById("searchSeat")
            .value
            .toLowerCase();


    const filter =
        document
            .getElementById("filterSeat")
            .value;


    const filtered =
        allSeats.filter(seat => {

            const matchesSearch =
                seat.seat_number
                    .toLowerCase()
                    .includes(search);


            const matchesFilter =
                filter === "all" ||
                seat.status === filter;


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    displaySeats(filtered);

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.innerText = message;

    toast.style.display = "block";


    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadSeats();
