import React, { useRef, useEffect } from 'react';
import { useLocation, Switch, Redirect } from 'react-router-dom';
import AppRoute from './utils/AppRoute';
import ScrollReveal from './utils/ScrollReveal';
import { getAuth } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";

// Layouts
import LayoutDefault from './layouts/LayoutDefault';
import AuthDefault from './layouts/AuthDefault';

// Views 
import Home from './views/homepage';
import Signup from './components/sections/Signup';
import Login from './components/sections/Login';
import ProfileMenu from './views/profilemenu';

const App = () => {

  const childRef = useRef();
  const auth = getAuth();
  let location = useLocation();

  useEffect(() => {
    document.body.classList.add('is-loaded')
    childRef.current.init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <ScrollReveal
      ref={childRef}
      children={() => (
        <Switch>
          <AppRoute exact path="/" component={Home} layout={LayoutDefault} />
            <AppRoute exact path="/signup/" component={Signup} layout={AuthDefault} />
            <AppRoute exact path="/login/" component={Login} layout={AuthDefault} />
            {auth.currentUser && (<AppRoute exact path="/profile/" component={ProfileMenu} layout={LayoutDefault} />)}
          <Redirect to="/" />
        </Switch>
      )} />
  );
}

export default App;