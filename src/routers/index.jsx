import Root, {loader as rootLoader} from '../Root.jsx'
import Login, {loginLoader, loginAction} from '../pages/Login.jsx'
import Configuration, {loader as configurationLoader} from '../pages/Configuration.jsx'
import Home, {homeLoader} from '../pages/Home.jsx'
import Error from '../pages/error.jsx'
import { createHashRouter } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    errorElement: <Error/>,
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
