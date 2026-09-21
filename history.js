let bookings = [];


// ================= LOAD =================

async function loadBookings() {

    try {

        const response =
            await fetch("/api/bookings");

        bookings =
            await response.json();

        displayBookings(bookings);

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load bookings"
        );

    }

}


// ================= DISPLAY =================

function displayBookings(data) {

    const table =
        document.getElementById(
            "bookingTable"
        );

    table.innerHTML = "";


    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px;">
                    📭 No booking records found
                </td>
            </tr>
        `;

        return;
    }


    data.forEach(booking => {

        const row =
            document.createElement("tr");


        const seat =
            booking.seats
            ? booking.seats.seat_number
            : "-";


        const date =
            new Date(
                booking.booking_date
            ).toLocaleString("en-IN");


        const statusClass =
            booking.status === "Booked"
            ? "booked"
            : "cancelled";


        row.innerHTML = `

            <td>
                👤 ${booking.student_name}
            </td>

            <td>
                📧 ${booking.student_email}
            </td>

            <td>
                <strong>
                    💺 ${seat}
                </strong>
            </td>

            <td>
                ${date}
            </td>

            <td>
                <span class="status ${statusClass}">
                    ${booking.status}
                </span>
            </td>

            <td>

                ${
                    booking.status === "Booked"

                    ?

                    `
                    <button
                        class="btn btn-danger"
                        onclick="cancelBooking(${booking.id})">

                        Cancel

                    </button>
                    `

                    :

                    "—"
                }

            </td>

        `;


        table.appendChild(row);

    });

}


// ================= CANCEL =================

async function cancelBooking(id) {

    if (!confirm(
        "Are you sure you want to cancel this booking?"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/cancel/${id}`,
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            showToast(
                result.message
            );

            return;
        }


        showToast(
            "✅ Booking cancelled"
        );


        loadBookings();


    } catch (error) {

        console.error(error);

        showToast(
            "Server error"
        );

    }

}


// ================= SEARCH =================

document
    .getElementById("searchBooking")
    .addEventListener(
        "input",
        searchBookings
    );


function searchBookings() {

    const value =
        document
            .getElementById("searchBooking")
            .value
            .toLowerCase();


    const filtered =
        bookings.filter(booking => {

            const name =
                booking.student_name
                    .toLowerCase();

            const email =
                booking.student_email
                    .toLowerCase();

            const seat =
                booking.seats
                ? booking.seats
                    .seat_number
                    .toLowerCase()
                : "";


            return (
                name.includes(value) ||
                email.includes(value) ||
                seat.includes(value)
            );

        });


    displayBookings(filtered);

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


loadBookings();
