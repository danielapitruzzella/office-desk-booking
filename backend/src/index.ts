import express from "express";
import cors from "cors";
import officesRouter from "./routes/offices";
import floorsRouter from "./routes/floors";
import bookingsRouter from "./routes/bookings";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/offices", officesRouter);
app.use("/api/floors", floorsRouter);
app.use("/api/bookings", bookingsRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
