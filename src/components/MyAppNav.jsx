import { NavLink } from "react-router";
import "./MyAppNav.css";

export function MyAppNav() {
  return (
      <nav>
        <div className="logo-container">
            <img src="src\assets\Logo.png" className="logo" alt="Taf'Yaa logo" />
            <h1>Taf'Yaa</h1>
        </div> 
        <ul>
            <li><NavLink to="/" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Home</NavLink></li>
            <li><NavLink to="/login" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Login</NavLink></li>
            <li><NavLink to="/signup" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Signup</NavLink></li>
            <li><NavLink to="/create" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Create</NavLink></li>
            <li><NavLink to="/join" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Join</NavLink></li>
            <li><NavLink to="/settings" className={({ isActive }) => (isActive ? 'active-link' : 'inactive-link')}>Settings</NavLink></li>
        </ul>
    </nav>
  );
}
