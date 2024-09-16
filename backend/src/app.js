const express = require("express");
// const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const applicantRoutes = require("./routes/applicantRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");

const {
    authenticateToken,
    authorizeApplicant, 
    authorizeRecruiter, 
  } = require("./middlewares/authorization");

 const app = express();
 

// app.use(
//   cors({
//     origin: [],
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//   })
// );

app.use(express.json());

app.get("/",(req,res)=>{
    res.json("server is alive");
})

app.use("/api/auth", authRoutes);

app.use("/api/applicant", authenticateToken, authorizeApplicant, applicantRoutes);
app.use("/api/recruiter", authenticateToken, authorizeRecruiter, recruiterRoutes);


module.exports = app;