// This file contains custom JavaScript for handling dynamic interactions on the frontend, such as form submissions and UI updates.

$(document).ready(function () {
    // Handle the Confirm Order submission
    $("#order-form").on("submit", function (e) {
        e.preventDefault();

        // 1. Collect cart data from the table
        const cart = [];
        $("#order-table tr").each(function (index, row) {
            // Skip the header row
            if (index === 0) return;

            const cells = $(row).find("td");
            // If it has enough cells to parse (the last row might be the total row)
            if (cells.length >= 5) {
                const foodName = $(cells[2]).text().trim();  // 'Pizza', 'Sandwich', etc.
                const priceText = $(cells[3]).text().replace('$', '').trim(); // e.g. "8.00"
                const qtyText = $(cells[4]).text().trim(); // e.g. "1"
                const totalText = $(cells[5]).text().replace('$', '').trim(); // e.g. "8.00"

                // If there's no price or if this row is the final total row, skip
                if (!priceText || isNaN(priceText)) return;

                cart.push({
                    name: foodName,
                    price: parseFloat(priceText),
                    quantity: parseInt(qtyText),
                    total: parseFloat(totalText)
                });
            }
        });

        // 2. Collect delivery details
        const fullName = $("#full-name").val();
        const phone = $("#phone").val();
        const email = $("#email").val();
        const address = $("#address").val();

        // 3. Create an order object
        const orderData = {
            fullName: fullName,
            phone: phone,
            email: email,
            address: address,
            cart: cart,
            createdAt: new Date().toISOString()
        };

        // 4. Send order data to the server
        $.ajax({
            type: "POST",
            url: "/api/orders",
            data: JSON.stringify(orderData),
            contentType: "application/json",
            success: function (response) {
                // 5. Initiate payment with Razorpay
                const options = {
                    key: "YOUR_RAZORPAY_KEY", // Replace with your Razorpay key
                    amount: response.amount, // Amount in paise
                    currency: "INR",
                    name: "Food Ordering",
                    description: "Order Payment",
                    order_id: response.orderId, // Use the order ID returned from the server
                    handler: function (paymentResponse) {
                        // Handle successful payment
                        $.ajax({
                            type: "POST",
                            url: "/api/payment/verify",
                            data: JSON.stringify({
                                orderId: response.orderId,
                                paymentId: paymentResponse.razorpay_payment_id
                            }),
                            contentType: "application/json",
                            success: function (verificationResponse) {
                                alert("Payment successful! Your Order ID: " + verificationResponse.orderId);
                                $("#order-form")[0].reset();
                            },
                            error: function (error) {
                                alert("Payment verification failed: " + error.responseJSON.message);
                            }
                        });
                    },
                    prefill: {
                        name: fullName,
                        email: email,
                        contact: phone
                    },
                    theme: {
                        color: "#F37254"
                    }
                };

                const rzp = new Razorpay(options);
                rzp.open();
            },
            error: function (error) {
                alert("Error placing order: " + error.responseJSON.message);
            }
        });
    });
});