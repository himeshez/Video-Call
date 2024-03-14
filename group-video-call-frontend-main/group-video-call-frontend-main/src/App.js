import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Main from './components/Main/Main'
import Room from './components/Room/Room'
import SignIn from './components/SignIn/SignIn'
import SignUp from './components/SignUp/SignUp'
import styled from 'styled-components'
import PrivateRoute from './PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      
        <Switch>
          <Route exact path="/signin" component={SignIn}/>
          <Route exact path="/signup" component={SignUp} />
          <AppContainer>
          <Route exact path="/" component={Main} />
          <Route exact path="/room/:roomId" component={Room} />
          </AppContainer>
        </Switch>
      
    </BrowserRouter>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  font-size: calc(8px + 2vmin);
  color: white;
  background-color: #454552;
  text-align: center;
`;

export default App;
