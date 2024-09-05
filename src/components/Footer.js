import React from "react";
import { Link } from "react-router-dom";
import "../style.css"

export default function Footer()
{
    return(
        <>
    <footer className="bg-dark text-white py-3">
        <div className="container d-flex justify-content-between align-items-center fixed">
            <Link className="nav-link text-light" aria-current="page" to="/">
                <img src="../images/clear-logo.png" alt="Logo" id="logo" className="d-inline-block align-text-top" />
            </Link>
        </div>
    </footer>
        </>
    );
}