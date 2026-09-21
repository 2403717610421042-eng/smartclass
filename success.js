async function loadSuccess() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const bookingId =
        params.get("bookingId");


    if (!bookingId) {
        return;
    }


    try {

        const response =
            await fetch("/api/bookings");

        const bookings =
            await response.json();


        const booking =
            bookings.find(
                item =>
                    item.id ==
                    bookingId
            );


        if (!booking) {
            return;
        }


        document.getElementById(
            "studentName"
        ).innerText =
            booking.student_name;


        document.getElementById(
            "studentEmail"
        ).innerText =
            booking.student_email;


        document.getElementById(
            "seatNumber"
        ).innerText =
            booking.seats
            ? booking.seats.seat_number
            : "-";


        document.getElementById(
            "bookingDate"
        ).innerText =
            new Date(
                booking.booking_date
            ).toLocaleString(
                "en-IN"
            );


    } catch (error) {

        console.error(error);

    }

}


loadSuccess();
