import { BrowserRouter as Router, Routes, Route, Switch } from 'react-router-dom';
import Navbar from'./components/layout/Navbar';
import Landing from'./components/layout/Landing';
import React, { Fragment } from 'react';
import'./App.css'; 

const App= () => (
  <Router>
    <Fragment>
      <Navbar/>
      <Routes>
        <Route exact path='/' element={<Landing/>}/>
      </Routes>
    </Fragment>)
  </Router>
);
  
export default App;
