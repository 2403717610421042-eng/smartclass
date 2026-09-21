let adminSeats = [];


// ==========================================
// LOAD ADMIN DATA
// ==========================================

async function loadAdminData() {

    try {

        const response =
            await fetch("/seats");


        adminSeats =
            await response.json();


        displayAdminSeats(
            adminSeats
        );


        loadAdminStatistics();


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load seat data"
        );

    }
}


// ==========================================
// DISPLAY TABLE
// ==========================================

function displayAdminSeats(seats) {

    const table =
        document.getElementById(
            "seatTable"
        );


    table.innerHTML = "";


    seats.forEach(seat => {

        const row =
            document.createElement("tr");


        const statusClass =
            seat.status === "Available"
                ? "status-available"
                : "status-booked";


        row.innerHTML = `

            <td>
                ${seat.id}
            </td>

            <td>
                <strong>
                    ${seat.seat_number}
                </strong>
            </td>

            <td class="${statusClass}">
                ${seat.status}
            </td>

            <td>

                ${
                    seat.status === "Booked"

                    ?

                    `<button
                        class="reset-btn"
                        onclick="resetSeat(${seat.id})"
                    >
                        Reset
                    </button>`

                    :

                    `<span>
                        ✓ Ready
                    </span>`
                }

            </td>

        `;


        table.appendChild(row);

    });

}


// ==========================================
// RESET ONE SEAT
// ==========================================

async function resetSeat(id) {

    const confirmReset =
        confirm(
            "Reset this seat?"
        );


    if (!confirmReset) {
        return;
    }


    try {

        const response =
            await fetch(
                `/reset/${id}`,
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        showToast(
            result.message
        );


        loadAdminData();


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to reset seat"
        );

    }

}


// ==========================================
// RESET ALL
// ==========================================

async function resetAllSeats() {

    const confirmReset =
        confirm(
            "Are you sure you want to reset ALL seats?"
        );


    if (!confirmReset) {
        return;
    }


    try {

        const response =
            await fetch(
                "/reset-all",
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        showToast(
            result.message
        );


        loadAdminData();


    } catch (error) {

        console.error(error);

        showToast(
            "Unable to reset all seats"
        );

    }

}


// ==========================================
// STATISTICS
// ==========================================

async function loadAdminStatistics() {

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

}


// ==========================================
// SEARCH
// ==========================================

document
    .getElementById("searchAdmin")
    .addEventListener(
        "input",
        filterAdmin
    );


// ==========================================
// FILTER
// ==========================================

document
    .getElementById("adminFilter")
    .addEventListener(
        "change",
        filterAdmin
    );


function filterAdmin() {

    const search =
        document
            .getElementById(
                "searchAdmin"
            )
            .value
            .toLowerCase();


    const filter =
        document
            .getElementById(
                "adminFilter"
            )
            .value;


    const filtered =
        adminSeats.filter(seat => {

            const searchMatch =
                seat.seat_number
                    .toLowerCase()
                    .includes(search);


            const filterMatch =
                filter === "all" ||
                seat.status === filter;


            return (
                searchMatch &&
                filterMatch
            );

        });


    displayAdminSeats(
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


    toast.innerText = message;

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

loadAdminData();
