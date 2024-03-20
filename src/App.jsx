import { VideoComponent } from "./VideoComponent.jsx";
import { JoiningVideoComponent } from "./JoiningVideoComponent.jsx";
import { WebinarJoiningForm } from "./WebinarJoiningForm/WebinarJoiningForm.jsx";
import { Health } from "./common/Health.jsx";
import { MeetingComponent } from './MeetingComponent.jsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<WebinarJoiningForm />}></Route>
          <Route exact path="/webinar" element={<VideoComponent />}></Route>
          <Route exact path="/meeting" element={<MeetingComponent />}></Route>
          <Route path="/_/health" component={Health}> </Route>
          <Route
            exact
            path="/webinar/guest"
            element={<JoiningVideoComponent />}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
