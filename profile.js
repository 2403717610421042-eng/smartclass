async function loadProfile() {

    const name =
        localStorage.getItem(
            "studentName"
        ) || "Student";


    const email =
        localStorage.getItem(
            "studentEmail"
        ) || "No email";


    const department =
        localStorage.getItem(
            "department"
        ) || "Not specified";


    const year =
        localStorage.getItem(
            "year"
        ) || "Not specified";


    document.getElementById(
        "profileName"
    ).innerText = name;


    document.getElementById(
        "profileEmail"
    ).innerText = email;


    document.getElementById(
        "profileDepartment"
    ).innerText = department;


    document.getElementById(
        "profileYear"
    ).innerText = year;


    try {

        const response =
            await fetch("/api/bookings");

        const bookings =
            await response.json();


        const studentBookings =
            bookings.filter(
                booking =>
                    booking.student_email
                    .toLowerCase() ===
                    email.toLowerCase()
            );


        document.getElementById(
            "totalBookings"
        ).innerText =
            studentBookings.length;


        const active =
            studentBookings.find(
                booking =>
                    booking.status === "Booked"
            );


        if (active && active.seats) {

            document.getElementById(
                "currentSeat"
            ).innerText =
                active.seats.seat_number;

        }

    } catch (error) {

        console.error(error);

    }

}


loadProfile();
