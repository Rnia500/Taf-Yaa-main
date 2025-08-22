import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  return (
    <div>
        <MyAppNav />
        <Link to="/" className="back-link">
        <h1><i class="fa-solid fa-arrow-left"></i> Back to Welcome</h1></Link>
        <div className="login-container">
        <form className="login-form">
            <h2 className="form-title"><strong>Welcome Back</strong></h2>
            <p>Sign in to access your family tree and preserve memories</p>    
            
            <div className="form-section">
                      
                <div className="input-group">
                    <label htmlFor="email">Email Address </label>
                    <div style={{ position: 'relative' }}>
                        <i class="fa fa-envelope" style={{ position:'absolute', left:'8px', top:'55%',transform:'translateY(-50%)', color:'#888', padding:'7px', backgroundColor:'#f1f3f4'}}></i>
                        <input
                        type="email"
                        id="email"
                        placeholder="Enter your Email"
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
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>
                  
                <div className="login-actions">
                    <Link to="/login" className="forgot-link">Forgot password?</Link>
                </div>
                <button type="submit" className="login-btn">Sign In to Your Heritage</button>
          </div>
          <div className="divider">
            <span>Or continue with</span>
          </div>
          <button type="button" className="google-signin-btn"><i class="fa-brands fa-google"></i><span className="google-icon"></span>
            Sign in with Google
          </button>
          <div className="signup-link">
            Don&apos;t have an account? <Link to="/signup">Create one here</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}