import Body from "../components/Body";
import Footer from "../components/Footer";
import { MyAppNav } from "../components/MyAppNav";


export default function Home() {
  return (
      <div>
        <MyAppNav /> 
        <Body />
        <Footer />  
    </div>
  );
}