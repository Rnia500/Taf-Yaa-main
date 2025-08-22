import { Link } from 'react-router-dom';
import './Body.css'; 

function Body() {
    return (
        <div className="body-content">
            <h1>Your Digital African Memory Keeper</h1>
            <p>Preserve your lineage, voice, and identity through stories, dialects, and traditions. <br /> Connect with your roots and build bridges across generations.</p>
            
            <div className="cards-container">
                <div className="card">
                    <i class="fa-solid fa-users"></i>
                    <h2>Start Your Journey</h2>
                    <p>Create a new family tree and begin preserving your heritage</p>
                    <Link to="/signup"><button className="btn-primary"><i class="fa-solid fa-user-plus"></i> Create Account</button></Link>
                </div>
                <div className="card">
                    <i class="fa-solid fa-qrcode"></i>
                    <h2>Join Your Family</h2>
                    <p>Connect to an existing family tree using a code or QR</p>
                    <Link to="/login"><button className="btn-secondary"><i class="fa-solid fa-arrow-right-to-bracket"></i> Login</button></Link>
                </div>
            </div>


            <div className="features">
                <div className="features-card">
                    <i class="fa-solid fa-users"></i>
                    <h2>Oral Storytelling</h2>
                    <p>Capture voices and stories of your elders through audio recordings</p>
                    
                </div>
                <div className="features-card">
                    <i class="fa-solid fa-heart"></i>
                    <h2>Cultural Identity</h2>
                    <p>Document traditions and customs that define your family heritage</p>
                    
                </div>
                <div className="features-card">
                    <i class="fa-solid fa-globe"></i>
                    <h2>Global Connection</h2>
                    <p>Reconnect families across borders through shared memories</p>
                    
                </div>
            </div>
        </div>
    );
}

export default Body;