import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Payment from './Payment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Payment />} />
      </Routes>
    </Router>
  );
}

export default App;