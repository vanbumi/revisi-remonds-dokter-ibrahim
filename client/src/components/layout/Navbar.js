import React from'react';

const Navbar= () => {
return (
// copy dan paste navbar dari remonds-theme disini, dan rubah class menjadi className//

    <nav className="navbar bg-dark">
        <h1>
            <a href="index.html"><i className="fas fa-code"></i>
            Remonds App</a>
        </h1>

        <ul>
            <li><a href="profiles.html">Members</a></li>
            <li><a href="register.html">Register</a></li>
            <li><a href="login.html">Login</a></li></ul></nav>  )};
            
export default Navbar;
