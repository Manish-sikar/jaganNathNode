
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const JwtCreate = (user) => {
  const PayloadData = {
    UserName: user.UserName, // Include the UserName from the user object
    Role: "ADMIN", // Use the Role from the user object
    iat: Math.floor(Date.now() / 1000), // Issued at time (current time)
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expiration time (1 hour from now)
  };

  // Generate JWT token with a secret key
  const token = jwt.sign(PayloadData, process.env.JWT_SECRET_KEY);

  return token;
};


// Hash user's password using bcrypt
const hashPassword = async (password) => {
  const saltRounds = 10; // Number of salt rounds for bcrypt
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashPassword , "hashpasword")
  return hashedPassword;
};

// Compare password for login validation
const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};

async function randomNumber(length = 6) {
  const numbers = "1234567890"; // Use only 0-9 to ensure numeric output
  let result = ""; // Initialize result as an empty string
  for (let i = length; i > 0; i -= 1) {
    result += numbers[Math.floor(Math.random() * numbers.length)]; // Use Math.floor to ensure index is an integer
  }
  return result;
}

module.exports = { JwtCreate, hashPassword, comparePassword ,randomNumber };
