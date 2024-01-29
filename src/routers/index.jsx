import Root, {rootLoader} from '../Root.jsx'
import Login, {loginLoader, loginAction} from '../pages/Login.jsx'
import Configuration, {loader as configurationLoader} from '../pages/Configuration.jsx'
import Home, {homeLoader} from '../pages/Home.jsx'
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        index: true,
        element: <Home/>,
        loader: homeLoader
      },
      {
        path: "configuration",
        element: <Configuration/>,
        loader: configurationLoader
      }
    ],
  },
  {
    path: "/login",
    element: <Login/>,
    loader: loginLoader,
    action: loginAction,
  },
]);

export default router;
