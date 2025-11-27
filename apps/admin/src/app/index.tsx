import "./styles.css";
import { Link } from "@repo/ui/link";

function App() {
  return (
    <div className="container">
      <h1 className="title">Admin App</h1>
      <p className="description">
        This is the admin application for Arena Web. Go to{" "}
        <Link href="http://localhost:3002" className="link">
          Arena Web
        </Link>
        to see the main application.
      </p>
    </div>
  );
}

export default App;
