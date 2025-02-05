import React from 'react';
import {Link } from 'react-router-dom';
import Styles from "./Header.module.css";

const Header = () => {
  return (
    <div className={Styles.wrapper}>
        <div className={Styles.links}>
          <Link to="/" className={Styles.link}>Discharge Summary Generator</Link>
        </div>
    </div>
  )
};
export default Header;