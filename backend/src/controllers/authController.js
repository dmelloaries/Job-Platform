const prisma = require("../utils/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Try to find the user in the Applicant table first
    let user = await prisma.applicant.findUnique({
      where: { email },
    });

    let userType = "Applicant";

    // If not found in Applicant table, try the Recruiter table
    if (!user) {
      user = await prisma.recruiter.findUnique({
        where: { email },
      });
      userType = "Recruiter";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compared the provided password with the hashed password stored in the database
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.id, role: userType },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d', 
      }
    );

    res.json({ message: "Login successful", token,userId: user.id, role: userType });
  } catch (error) {
    console.error("Error during login:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.signup = async (req, res) => {
  const { name, email, password, type } = req.body;

  if (!["Recruiter", "Applicant"].includes(type)) {
    return res.status(400).json({ message: "Invalid user type" });
  }

  try {
    // Check if the email is already registered
    const existingUser = await prisma[type.toLowerCase()].findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma[type.toLowerCase()].create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("Error during signup:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
