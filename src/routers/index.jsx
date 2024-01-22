import Root, {rootLoader} from '../Root.jsx'
import Login from '../pages/Login.jsx'
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Home/>
      },
      {
        path: "/login",
        element: <Login/>
      },
    ],
  },
]);

export default router;
