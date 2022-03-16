import React, { useRef, useEffect } from 'react';
import { useLocation, Switch, Redirect } from 'react-router-dom';
import AppRoute from './utils/AppRoute';
import ScrollReveal from './utils/ScrollReveal';
import "bootstrap/dist/css/bootstrap.min.css";

// Layouts
import LayoutDefault from './layouts/LayoutDefault';
import AuthDefault from './layouts/AuthDefault';

// Views 
import Home from './views/homepage';
import Signup from './components/sections/Signup';
import Login from './components/sections/Login';

const App = () => {

  const childRef = useRef();
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
          <Redirect to="/" />
        </Switch>
      )} />
  );
}

export default App;