let allSeats = [];

let selectedSeatId = null;


// ================= LOAD =================

async function loadSeats() {

    try {

        const response =
            await fetch("/api/seats");

        allSeats =
            await response.json();

        displaySeats(allSeats);

    } catch (error) {

        console.error(error);

        showToast(
            "❌ Unable to load seats"
        );

    }
}


// ================= DISPLAY =================

function displaySeats(seats) {

    const container =
        document.getElementById(
            "seatContainer"
        );

    container.innerHTML = "";


    seats.forEach(seat => {

        const button =
            document.createElement("button");

        button.className = "seat";


        if (seat.status === "Available") {

            button.classList.add("available");

            button.innerHTML =
                `💺 ${seat.seat_number}`;

            button.onclick = () =>
                selectSeat(
                    seat.id,
                    seat.seat_number
                );

        } else {

            button.classList.add("booked");

            button.innerHTML =
                `🔒 ${seat.seat_number}`;

            button.disabled = true;

        }


        if (selectedSeatId === seat.id) {

            button.classList.add("selected");

        }


        container.appendChild(button);

    });

}


// ================= SELECT =================

function selectSeat(id, number) {

    selectedSeatId = id;

    document.getElementById(
        "selectedSeat"
    ).innerText = number;

    displaySeats(
        filterSeats()
    );

}


// ================= FILTER =================

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


    return allSeats.filter(seat => {

        const searchMatch =
            seat.seat_number
                .toLowerCase()
                .includes(search);

        const filterMatch =
            filter === "all" ||
            seat.status === filter;

        return searchMatch &&
               filterMatch;

    });

}


document
    .getElementById("searchSeat")
    .addEventListener(
        "input",
        () => displaySeats(filterSeats())
    );


document
    .getElementById("filterSeat")
    .addEventListener(
        "change",
        () => displaySeats(filterSeats())
    );


// ================= BOOK =================

async function confirmBooking() {

    if (!selectedSeatId) {

        showToast(
            "⚠️ Please select a seat"
        );

        return;
    }


    const name =
        document
            .getElementById("studentName")
            .value
            .trim();


    const email =
        document
            .getElementById("studentEmail")
            .value
            .trim();


    const department =
        document
            .getElementById("department")
            .value
            .trim();


    const year =
        document
            .getElementById("year")
            .value;


    if (!name || !email) {

        showToast(
            "⚠️ Name and email are required"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/book/${selectedSeatId}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        student_name: name,
                        student_email: email,
                        department,
                        year
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


        // Save student profile

        localStorage.setItem(
            "studentName",
            name
        );

        localStorage.setItem(
            "studentEmail",
            email
        );

        localStorage.setItem(
            "department",
            department
        );

        localStorage.setItem(
            "year",
            year
        );


        // Go success page

        window.location.href =
            `success.html?bookingId=${result.booking.id}`;

    } catch (error) {

        console.error(error);

        showToast(
            "❌ Server error"
        );

    }

}


// ================= CLEAR =================

function clearForm() {

    selectedSeatId = null;

    document.getElementById(
        "selectedSeat"
    ).innerText =
        "No seat selected";

    document.getElementById(
        "studentName"
    ).value = "";

    document.getElementById(
        "studentEmail"
    ).value = "";

    document.getElementById(
        "department"
    ).value = "";

    document.getElementById(
        "year"
    ).value = "";

    displaySeats(
        filterSeats()
    );

}


// ================= TOAST =================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.innerText = message;

    toast.style.display = "block";


    setTimeout(() => {

        toast.style.display = "none";

    }, 3000);

}


loadSeats();
