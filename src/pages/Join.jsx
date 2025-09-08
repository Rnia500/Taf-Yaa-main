import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";
import { Link } from "react-router-dom";
import "./Join.css";
import Tabs from "../components/Tabs";

export default function Join() {
  return (
    <div>
      <MyAppNav />
      <Link to="/" className="back-link"><h1><i class="fa-solid fa-arrow-left"></i> Back to Welcome</h1></Link>
      <div className="join-container">
        <form className="join-form">
          <i class="fa-solid fa-users"></i>
          <h2>Join a Family Tree</h2>
          <p>Connect to an existing family tree using an invitation code or QR code</p>
          <Tabs/>
        </form>
      </div>
      <Footer />
    </div>
  );
}