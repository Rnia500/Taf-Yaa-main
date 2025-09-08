import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";
import { Link } from "react-router-dom";
import "./Create.css";
import Upload from "../components/Upload";



export default function Create() {
  return (
    <div>
      <MyAppNav />
      <Link to="/" className="back-link"><h1><i class="fa-solid fa-arrow-left"></i> Back to Welcome</h1></Link>
      <div className="create-container">
        <form className="create-form">
          <i class="fa-solid fa-users"></i>
          <div className="create"><h2>Create Your Family Tree</h2>
          <p>Start by adding yourself as the root of your family tree. You can invite family members later.</p></div>
          
          <div className="family-info"><h2><i class="fa-solid fa-users"></i>Family Tree Information</h2></div>
          
          <div className="form-section">
            <div className="input-group">
              <label htmlFor="text">Family Tree Name</label>
              <div>
                  <input
                  type="text"
                  id="text"
                  name="text"
                  required
                  placeholder="e.g., The Mansah Family Tree"
                  />
              </div>
              <p>Choose a name that represents your family lineage</p>
              <div className="per-info"><h2><i class="fa-solid fa-users"></i> Your Information (Root Person)</h2></div>
              <Upload />


              <label htmlFor="text">Your Full Name</label>
              <div>
                  <input
                  type="text"
                  id="text"
                  name="text"
                  required
                  placeholder="Enter your full name"
                  />
              </div>

              <div className="birth-section">
                <div className="birth-group">
                  <label htmlFor="text">Birth Date</label>
                  <div>
                    <input
                    type="date"
                    id="date"
                    name="date"
                    required
                    placeholder=""
                    />
                  </div>
                </div>

                <div className="birth-group">
                  <label htmlFor="location">Birth Place</label>
                  <div>
                    <input
                    type="location"
                    id="location"
                    name="location"
                    required
                    placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="story-group">
              <label htmlFor="">Your Story (Optional)</label>
              <div className="story-box">
                  <input
                  type="text"
                  id="text"
                  name="text"
                  placeholder="Tell your story... Where did you grow up? What traditions are important to you?"
                  />
                </div>
                <p>Share your story to keep preserve your voice and experiences for future generations</p>
              </div>
            </div>
            <div className="create-end"><button type="submit" className="login-btn">Create My Family Tree</button>
            <p>You can add family members and invite them to contribute after creating your tree</p></div>
          </div>

          
        </form>
      </div>
      <Footer />
    </div>
  );
}