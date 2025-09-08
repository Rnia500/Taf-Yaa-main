import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";
import { Link } from "react-router-dom";
import "./Settings.css";
import ProfileForm from "../components/ProfileForm";


export default function Settings() {
  return (
    <div>
      <MyAppNav />
      <Link to="/" className="back-link">
      <h1><i class="fa-solid fa-arrow-left"></i> Back to Welcome</h1></Link>
      <ProfileForm />
      <Footer />
    </div>
  );
}