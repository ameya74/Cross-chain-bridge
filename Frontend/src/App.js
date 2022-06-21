import NavBar from "./Components/NavBar";
// import Content from "./Components/Content";
import { MoralisProvider } from "react-moralis";
function App() {
  return (
    <div className="App">
      <MoralisProvider appId="7uHE0G7TIPiZ9Gb4dwlgcJiZE4guMX4EiZkOS5IG" serverUrl="https://yx5z4yhqr71r.usemoralis.com:2053/server">
      <NavBar/>
      {/* <Content/> */}
      </MoralisProvider>
    </div>
  );
}

export default App;
