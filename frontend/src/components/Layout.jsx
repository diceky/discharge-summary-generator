import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Styles from "./Layout.module.css";

const Layout = () => {
    const location = useLocation();

    const backgroundColor = (() => {
        switch (location.pathname) {
          case '/':
            return Styles.white;
          // case '/contrastive':
          //   return Styles.yellow;
          default:
            return Styles.white;
        }
      })();

    return (
        <div className={backgroundColor}>
            <Header />
            <Outlet />
        </div>

    )
};
export default Layout;