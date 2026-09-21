const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const PORT = process.env.PORT || 3000;


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ==========================================
// ADMIN PAGE
// ==========================================

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});


// ==========================================
// HISTORY PAGE
// ==========================================

app.get("/history.html", (req, res) => {
    res.sendFile(path.join(__dirname, "history.html"));
});


// ==========================================
// GET ALL SEATS
// ==========================================

app.get("/seats", async (req, res) => {

    const { data, error } = await supabase
        .from("seats")
        .select("*")
        .order("id");

    if (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to load seats"
        });
    }

    res.json(data);
});


// ==========================================
// GET STATISTICS
// ==========================================

app.get("/stats", async (req, res) => {

    const { data, error } = await supabase
        .from("seats")
        .select("status");

    if (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to get statistics"
        });
    }

    const total = data.length;

    const available = data.filter(
        seat => seat.status === "Available"
    ).length;

    const booked = data.filter(
        seat => seat.status === "Booked"
    ).length;

    res.json({
        total,
        available,
        booked
    });
});


// ==========================================
// BOOK SEAT
// ==========================================

app.post("/book/:id", async (req, res) => {

    const id = req.params.id;

    const {
        student_name,
        student_email
    } = req.body;

    if (!student_name || !student_email) {
        return res.status(400).json({
            success: false,
            message: "Student name and email are required"
        });
    }


    // Check seat
    const { data: seat, error: seatError } = await supabase
        .from("seats")
        .select("*")
        .eq("id", id)
        .single();

    if (seatError || !seat) {
        return res.status(404).json({
            success: false,
            message: "Seat not found"
        });
    }


    if (seat.status === "Booked") {
        return res.status(400).json({
            success: false,
            message: "This seat is already booked"
        });
    }


    // Update seat
    const { data: updatedSeat, error: updateError } = await supabase
        .from("seats")
        .update({
            status: "Booked"
        })
        .eq("id", id)
        .eq("status", "Available")
        .select()
        .single();

    if (updateError || !updatedSeat) {
        return res.status(400).json({
            success: false,
            message: "Seat could not be booked"
        });
    }


    // Insert booking
    const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert([
            {
                seat_id: id,
                student_name: student_name,
                student_email: student_email,
                status: "Booked"
            }
        ])
        .select()
        .single();


    if (bookingError) {

        // Roll back seat if booking failed
        await supabase
            .from("seats")
            .update({
                status: "Available"
            })
            .eq("id", id);

        return res.status(500).json({
            success: false,
            message: "Booking could not be created"
        });
    }


    res.json({
        success: true,
        message: "Seat booked successfully",
        booking: booking
    });
});


// ==========================================
// GET BOOKINGS
// ==========================================

app.get("/bookings", async (req, res) => {

    const { data, error } = await supabase
        .from("bookings")
        .select(`
            id,
            student_name,
            student_email,
            booking_date,
            status,
            seat_id,
            seats (
                seat_number
            )
        `)
        .order("booking_date", {
            ascending: false
        });

    if (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to load bookings"
        });
    }

    res.json(data);
});


// ==========================================
// CANCEL BOOKING
// ==========================================

app.post("/cancel/:id", async (req, res) => {

    const bookingId = req.params.id;


    const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();


    if (bookingError || !booking) {

        return res.status(404).json({
            success: false,
            message: "Booking not found"
        });
    }


    // Make seat available
    const { error: seatError } = await supabase
        .from("seats")
        .update({
            status: "Available"
        })
        .eq("id", booking.seat_id);


    if (seatError) {

        return res.status(500).json({
            success: false,
            message: "Unable to release seat"
        });
    }


    // Update booking status
    const { error: updateError } = await supabase
        .from("bookings")
        .update({
            status: "Cancelled"
        })
        .eq("id", bookingId);


    if (updateError) {

        return res.status(500).json({
            success: false,
            message: "Unable to cancel booking"
        });
    }


    res.json({
        success: true,
        message: "Booking cancelled successfully"
    });
});


// ==========================================
// RESET ONE SEAT
// ==========================================

app.post("/reset/:id", async (req, res) => {

    const id = req.params.id;


    const { error } = await supabase
        .from("seats")
        .update({
            status: "Available"
        })
        .eq("id", id);


    if (error) {

        return res.status(500).json({
            success: false,
            message: "Unable to reset seat"
        });
    }


    // Cancel active booking for this seat
    await supabase
        .from("bookings")
        .update({
            status: "Cancelled"
        })
        .eq("seat_id", id)
        .eq("status", "Booked");


    res.json({
        success: true,
        message: "Seat reset successfully"
    });
});


// ==========================================
// RESET ALL SEATS
// ==========================================

app.post("/reset-all", async (req, res) => {

    const { error } = await supabase
        .from("seats")
        .update({
            status: "Available"
        })
        .neq("id", 0);


    if (error) {

        return res.status(500).json({
            success: false,
            message: "Unable to reset seats"
        });
    }


    await supabase
        .from("bookings")
        .update({
            status: "Cancelled"
        })
        .eq("status", "Booked");


    res.json({
        success: true,
        message: "All seats reset successfully"
    });
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log("======================================");
    console.log(" Smart Classroom Seat Booking System");
    console.log("======================================");
    console.log(`Server running on port ${PORT}`);
});
