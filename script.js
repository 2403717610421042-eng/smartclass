alert("script.js loaded successfully");

async function loadSeats() {
    try {
        const response = await fetch("/seats");

        if (!response.ok) {
            throw new Error("Failed to fetch seats");
        }

        const seats = await response.json();

        const container = document.getElementById("seatContainer");

        container.innerHTML = "";

        seats.forEach((seat) => {

            const btn = document.createElement("button");

            btn.innerText = seat.seat_number;

            btn.style.width = "80px";
            btn.style.height = "80px";
            btn.style.margin = "10px";
            btn.style.fontSize = "18px";
            btn.style.fontWeight = "bold";
            btn.style.color = "white";
            btn.style.border = "none";
            btn.style.borderRadius = "8px";
            btn.style.cursor = "pointer";

            if (seat.status === "Available") {

                btn.style.backgroundColor = "green";

                btn.onclick = async () => {

                    await fetch(`/book/${seat.id}`, {
                        method: "POST"
                    });

                    loadSeats();
                };

            } else {

                btn.style.backgroundColor = "red";
                btn.disabled = true;
            }

            container.appendChild(btn);
        });

    } catch (error) {
        console.error(error);

        document.getElementById("seatContainer").innerHTML =
            "<h3>Error loading seats</h3>";
    }
}

loadSeats();