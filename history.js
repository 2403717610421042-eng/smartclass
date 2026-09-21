let bookings = [];


// ==========================================
// LOAD BOOKINGS
// ==========================================

async function loadBookings() {

    try {

        const response =
            await fetch("/bookings");


        bookings =
            await response.json();


        displayBookings(
            bookings
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load bookings"
        );

    }

}


// ==========================================
// DISPLAY BOOKINGS
// ==========================================

function displayBookings(data) {

    const table =
        document.getElementById(
            "bookingTable"
        );


    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                >
                    No bookings found
                </td>

            </tr>

        `;

        return;
    }


    data.forEach(booking => {

        const row =
            document.createElement(
                "tr"
            );


        const seatNumber =
            booking.seats
                ? booking.seats.seat_number
                : "-";


        const date =
            new Date(
                booking.booking_date
            ).toLocaleString();


        const active =
            booking.status === "Booked";


        row.innerHTML = `

            <td>
                ${booking.student_name}
            </td>

            <td>
                ${booking.student_email}
            </td>

            <td>
                <strong>
                    ${seatNumber}
                </strong>
            </td>

            <td>
                ${date}
            </td>

            <td>

                <span
                    class="${
                        active
                        ? "status-booked"
                        : "status-available"
                    }"
                >
                    ${booking.status}
                </span>

            </td>

            <td>

                ${
                    active

                    ?

                    `<button
                        class="reset-btn"
                        onclick="cancelBooking(${booking.id})"
                    >
                        Cancel
                    </button>`

                    :

                    `<span>
                        —
                    </span>`
                }

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// CANCEL BOOKING
// ==========================================

async function cancelBooking(id) {

    const confirmation =
        confirm(
            "Cancel this booking?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `/cancel/${id}`,
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        showToast(
            result.message
        );


        loadBookings();


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to cancel booking"
        );

    }

}


// ==========================================
// SEARCH BOOKINGS
// ==========================================

document
    .getElementById(
        "searchBooking"
    )
    .addEventListener(
        "input",
        searchBookings
    );


function searchBookings() {

    const search =
        document
            .getElementById(
                "searchBooking"
            )
            .value
            .toLowerCase();


    const filtered =
        bookings.filter(booking => {

            return (

                booking.student_name
                    .toLowerCase()
                    .includes(search)

                ||

                booking.student_email
                    .toLowerCase()
                    .includes(search)

            );

        });


    displayBookings(
        filtered
    );

}


// ==========================================
// TOAST
// ==========================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.innerText =
        message;


    toast.style.display =
        "block";


    setTimeout(() => {

        toast.style.display =
            "none";

    }, 3000);

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadBookings();
