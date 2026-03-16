function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      alert("Login Successful");

      // save token if needed
      localStorage.setItem("token", data.token);

      // redirect to employee dashboard
      window.location.href = "employee.html";
      // OR full path
      // window.location.href = "http://127.0.0.1:5500/frontend/employee.html";
    } else {
      alert("Invalid login");
    }
  })
  .catch(err => console.log(err));
}