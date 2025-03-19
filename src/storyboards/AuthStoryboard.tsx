import { BrowserRouter } from "react-router-dom";
import AuthPages from "./AuthPages";

export default function AuthStoryboard() {
  return (
    <BrowserRouter>
      <AuthPages />
    </BrowserRouter>
  );
}
