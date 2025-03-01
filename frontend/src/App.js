import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { TrainingProvider } from './contexts/TrainingContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import SequenceList from './pages/SequenceList';
import SequenceDetail from './pages/SequenceDetail';
import SequenceFlow from './components/TrainingModes/SequenceFlow';
import FreeTraining from './components/TrainingModes/FreeTraining';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import './App.css';

const App = () => {
  return (
    <Router>
      <TrainingProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/sequences" component={SequenceList} />
              <Route exact path="/sequences/:id" component={SequenceDetail} />
              <Route exact path="/train/sequence/:sequenceId" component={SequenceFlow} />
              <Route exact path="/train/free" component={FreeTraining} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route path="/404" component={NotFound} />
              <Redirect to="/404" />
            </Switch>
          </main>
          <Footer />
        </div>
      </TrainingProvider>
    </Router>
  );
};

export default App;