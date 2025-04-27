import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sentiment from "./pages/Sentiment";
import Profile from "./pages/Profile";
import PostList from "./components/PostList";
import CreatePost from "./components/CreatePost";
import Result from "./pages/Result";
import RealTimeSentiment from "./pages/RealTimeSentiment";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/sentiment" element={<Sentiment />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/result" element={<Result />} />
        <Route path="/realtime-detection" element={<RealTimeSentiment />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
