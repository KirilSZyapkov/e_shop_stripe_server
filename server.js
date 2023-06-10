const expres = require("express");
const app = expres();
const { config } = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      submit_type: "pay",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      line_items: req.body.map((item) => {
        return {
          price_data: {
            currency: "bgn",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url: `${req.headers.origin}?success=true`,
      cancel_url: `${req.headers.origin}?success=true`,
    });

    res.status(200).json(session);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log(`Server is listening on port http://localhost:3000`);
});
