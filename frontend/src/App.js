import './App.css';
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './Home.js'
import Upload from './Upload.js'
import Recognize from './Recognize.js'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/new-face" element={<Upload/>}/>
          <Route path="/recognize-faces" element={<Recognize/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
