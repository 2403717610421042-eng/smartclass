const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// IMPORTANT: serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Supabase connection
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const PORT = process.env.PORT || 3000;

/* ---------------- ROUTES ---------------- */

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Admin page
app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "admin.html"));
});

// Get all seats
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

// Book seat
app.post("/book/:id", async (req, res) => {
    const id = req.params.id;

    const { error } = await supabase
        .from("seats")
        .update({ status: "Booked" })
        .eq("id", id);

    if (error) {
        return res.status(500).json(error);
    }

    res.json({
        success: true,
        message: "Seat Booked Successfully"
    });
});

// Reset seat
app.post("/reset/:id", async (req, res) => {
    const id = req.params.id;

    const { error } = await supabase
        .from("seats")
        .update({ status: "Available" })
        .eq("id", id);

    if (error) {
        return res.status(500).json(error);
    }

    res.json({
        success: true,
        message: "Seat Reset Successfully"
    });
});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});