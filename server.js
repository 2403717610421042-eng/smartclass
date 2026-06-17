const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve index.html, admin.html, style.css, script.js, admin.js
app.use(express.static(__dirname));

// Supabase Connection
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Home Page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Get All Seats
app.get("/seats", async (req, res) => {

    const { data, error } = await supabase
        .from("seats")
        .select("*")
        .order("id");

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data);
});

// Book Seat
app.post("/book/:id", async (req, res) => {

    const id = req.params.id;

    const { error } = await supabase
        .from("seats")
        .update({
            status: "Booked"
        })
        .eq("id", id);

    if (error) {
        return res.status(500).json(error);
    }

    res.json({
        success: true,
        message: "Seat Booked Successfully"
    });
});

// Reset Seat (Admin)
app.post("/reset/:id", async (req, res) => {

    const id = req.params.id;

    const { error } = await supabase
        .from("seats")
        .update({
            status: "Available"
        })
        .eq("id", id);

    if (error) {
        return res.status(500).json(error);
    }

    res.json({
        success: true,
        message: "Seat Reset Successfully"
    });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});