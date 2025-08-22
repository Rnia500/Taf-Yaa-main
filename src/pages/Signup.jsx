import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";
import { Link } from "react-router-dom";

import "./Signup.css";


export default function Signup() {
  return (
        <div>
            <MyAppNav />
            
            <Link to="/" className="back-link">
            <h1><i class="fa-solid fa-arrow-left"></i> Back to Welcome</h1></Link>
            <div className="login-container">
            <form className="login-form">
                <h2 className="form-title"><strong>Begin Your Heritage Journey</strong></h2>
                <p>Create your account to start preserving your <br /> family's legacy</p>    
                
                <div className="name-section">
                    <div className="input-group">
                        <label htmlFor="name">First Name </label>
                        <div style={{ position: 'relative' }}>
                            <i class="fa fa-user" style={{ position:'absolute', left:'8px', top:'55%',transform:'translateY(-50%)', color:'#888', padding:'7px', backgroundColor:'#f1f3f4'}}></i>
                            <input
                            type="text"
                            id="text"
                            placeholder="First Name"
                            required
                            style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="name">Last Name </label>
                        <div>
                            <input
                            type="text"
                            id="text"
                            placeholder="Last Name"
                            required
                            />
                        </div>
                    </div>

                </div>
                
                <div className="form-section">
                        
                    <div className="input-group">
                        <label htmlFor="email">Email Address </label>
                        <div style={{ position: 'relative' }}>
                            <i class="fa fa-envelope" style={{ position:'absolute', left:'8px', top:'55%',transform:'translateY(-50%)', color:'#888', padding:'7px', backgroundColor:'#f1f3f4'}}></i>
                            <input
                            type="email"
                            id="email"
                            placeholder="your@email.com"
                            required
                            style={{ paddingLeft: '40px' }} />
                        </div>
                    </div>
                            
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div style={{ position: 'relative' }}>
                            <i class="fa fa-lock" style={{ position:'absolute', left:'8px', top:'55%',transform:'translateY(-50%)', color:'#888', padding:'7px', backgroundColor:'#f1f3f4'}}></i>
                            <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Create a strong password"
                            style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                      
                    <div className="input-group">
                        <label htmlFor="password">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <i class="fa fa-lock" style={{ position:'absolute', left:'8px', top:'55%',transform:'translateY(-50%)', color:'#888', padding:'7px', backgroundColor:'#f1f3f4'}}></i>
                            <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            placeholder="Confirm your password"
                            style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>    
                    
                    <div className="login-actions">
                       I agree to the <Link to="/signup" className="forgot-link"> Terms of Service </Link> and <Link to="/signup" className="forgot-link"> Privacy Policy </Link> 
                    </div>
                    <button type="submit" className="login-btn">Create My Heritage Account</button>
            </div>
            <div className="divider">
                <span>Or sign up with</span>
            </div>
            <button type="button" className="google-signin-btn"><i class="fa-brands fa-google"></i><span className="google-icon"></span>Continue with Google</button>
            <div className="signup-link">
                Already have an account? <Link to="/login">Sign in here</Link>
            </div>
            </form>
        </div>
        <Footer />
        </div>
    );
}