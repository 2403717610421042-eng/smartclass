const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);


// ================= HOME =================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );
});


// ================= GET SEATS =================

app.get("/api/seats", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("seats")
            .select("*")
            .order("id", { ascending: true });

        if (error) {
            throw error;
        }

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load seats"
        });

    }
});


// ================= STATISTICS =================

app.get("/api/stats", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("seats")
            .select("status");

        if (error) {
            throw error;
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

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load statistics"
        });

    }
});


// ================= BOOK SEAT =================

app.post("/api/book/:id", async (req, res) => {

    try {

        const seatId = req.params.id;

        const {
            student_name,
            student_email,
            department,
            year
        } = req.body;


        if (!student_name || !student_email) {

            return res.status(400).json({
                message: "Name and email are required"
            });

        }


        // Check seat

        const { data: seat, error: seatError } =
            await supabase
                .from("seats")
                .select("*")
                .eq("id", seatId)
                .single();


        if (seatError || !seat) {

            return res.status(404).json({
                message: "Seat not found"
            });

        }


        if (seat.status !== "Available") {

            return res.status(400).json({
                message: "Seat is already booked"
            });

        }


        // Update seat

        const { error: updateError } =
            await supabase
                .from("seats")
                .update({
                    status: "Booked"
                })
                .eq("id", seatId);


        if (updateError) {
            throw updateError;
        }


        // Create booking

        const { data: booking, error: bookingError } =
            await supabase
                .from("bookings")
                .insert([
                    {
                        seat_id: seatId,
                        student_name,
                        student_email,
                        department,
                        year,
                        status: "Booked"
                    }
                ])
                .select()
                .single();


        if (bookingError) {

            await supabase
                .from("seats")
                .update({
                    status: "Available"
                })
                .eq("id", seatId);

            throw bookingError;
        }


        res.json({
            message: "Booking successful",
            booking
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Booking failed"
        });

    }
});


// ================= ALL BOOKINGS =================

app.get("/api/bookings", async (req, res) => {

    try {

        const { data, error } =
            await supabase
                .from("bookings")
                .select(`
                    *,
                    seats (
                        seat_number
                    )
                `)
                .order(
                    "booking_date",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to load bookings"
        });

    }
});


// ================= CANCEL BOOKING =================

app.post("/api/cancel/:id", async (req, res) => {

    try {

        const bookingId = req.params.id;


        const { data: booking, error } =
            await supabase
                .from("bookings")
                .select("*")
                .eq("id", bookingId)
                .single();


        if (error || !booking) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }


        // Make seat available

        await supabase
            .from("seats")
            .update({
                status: "Available"
            })
            .eq("id", booking.seat_id);


        // Cancel booking

        await supabase
            .from("bookings")
            .update({
                status: "Cancelled"
            })
            .eq("id", bookingId);


        res.json({
            message: "Booking cancelled successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to cancel booking"
        });

    }
});


// ================= RESET SEAT =================

app.post("/api/reset/:id", async (req, res) => {

    try {

        const seatId = req.params.id;


        await supabase
            .from("seats")
            .update({
                status: "Available"
            })
            .eq("id", seatId);


        await supabase
            .from("bookings")
            .update({
                status: "Cancelled"
            })
            .eq("seat_id", seatId)
            .eq("status", "Booked");


        res.json({
            message: "Seat reset successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to reset seat"
        });

    }
});


// ================= RESET ALL =================

app.post("/api/reset-all", async (req, res) => {

    try {

        await supabase
            .from("seats")
            .update({
                status: "Available"
            })
            .neq("id", 0);


        await supabase
            .from("bookings")
            .update({
                status: "Cancelled"
            })
            .eq("status", "Booked");


        res.json({
            message: "All seats reset successfully"
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Unable to reset seats"
        });

    }
});


// ================= SERVER =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("   SMART CLASSROOM SEAT BOOKING");
    console.log("======================================");
    console.log(`   Server: http://localhost:${PORT}`);
    console.log("======================================");

});
