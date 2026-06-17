const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Home Page
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Classroom Seat Booking</title>
        <style>
            body{
                font-family: Arial, sans-serif;
                text-align:center;
                margin:20px;
            }

            #seatContainer{
                display:flex;
                flex-wrap:wrap;
                justify-content:center;
                gap:10px;
                margin-top:20px;
            }

            .seat{
                width:80px;
                height:80px;
                border:none;
                color:white;
                font-size:18px;
                cursor:pointer;
            }

            .available{
                background:green;
            }

            .booked{
                background:red;
                cursor:not-allowed;
            }
        </style>
    </head>
    <body>

        <h1>Smart Classroom Seat Booking System</h1>

        <div id="seatContainer"></div>

        <script>
            async function loadSeats(){

                const response = await fetch('/seats');
                const seats = await response.json();

                const container = document.getElementById('seatContainer');
                container.innerHTML = '';

                seats.forEach(seat => {

                    const btn = document.createElement('button');

                    btn.innerText = seat.seat_number;
                    btn.classList.add('seat');

                    if(seat.status === 'Available'){
                        btn.classList.add('available');

                        btn.onclick = async () => {

                            await fetch('/book/' + seat.id,{
                                method:'POST'
                            });

                            loadSeats();
                        };
                    }
                    else{
                        btn.classList.add('booked');
                        btn.disabled = true;
                    }

                    container.appendChild(btn);
                });
            }

            loadSeats();
        </script>

    </body>
    </html>
    `);
});

// Get Seats
app.get("/seats", async (req, res) => {

    const { data, error } = await supabase
        .from("seats")
        .select("*");

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
        .update({ status: "Booked" })
        .eq("id", id);

    if (error) {
        return res.status(500).json(error);
    }

    res.json({
        message: "Seat Booked Successfully"
    });
});

// Start Server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Running on Port 3000");
});